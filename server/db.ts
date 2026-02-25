import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dns from "dns";
import { promisify } from "util";
import * as schema from "@shared/schema";

const { Pool } = pg;
const dnsLookup = promisify(dns.lookup);

function isExternalHost(hostname: string): boolean {
  return hostname.includes('.') && !hostname.startsWith('127.') && hostname !== 'localhost';
}

function buildUrlFromPgVars(): string | null {
  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
    const port = PGPORT || "5432";
    const encoded = encodeURIComponent(PGPASSWORD);
    return `postgresql://${PGUSER}:${encoded}@${PGHOST}:${port}/${PGDATABASE}`;
  }
  return null;
}

async function tryResolveHost(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    if (isExternalHost(hostname) || /^[\d.]+$/.test(hostname) || hostname === "localhost") {
      console.log(`[DB] Host resolvable directly (host: ${hostname})`);
      return url;
    }
    const { address } = await dnsLookup(hostname);
    parsed.hostname = address;
    console.log(`[DB] Resolved ${hostname} -> ${address}`);
    return parsed.toString();
  } catch {
    return null;
  }
}

async function resolveDbUrl(): Promise<string> {
  const dbUrl = process.env.DATABASE_URL;
  const neonUrl = process.env.NEON_DATABASE_URL;

  // Step 1: Try DATABASE_URL — resolve internal hostnames like "helium" (works in dev).
  if (dbUrl) {
    const resolved = await tryResolveHost(dbUrl);
    if (resolved) {
      console.log(`[DB] Using DATABASE_URL`);
      return resolved;
    }
    console.log(`[DB] DATABASE_URL unresolvable, trying PG* environment variables`);
  }

  // Step 2: Build connection from PG* vars — Replit sets these differently in
  // production deployments, pointing to the production database.
  const pgUrl = buildUrlFromPgVars();
  if (pgUrl) {
    const resolved = await tryResolveHost(pgUrl);
    if (resolved) {
      console.log(`[DB] Using production database from PG* environment variables`);
      return resolved;
    }
    console.log(`[DB] PG* vars host also unresolvable`);
  }

  // Step 3: Try NEON_DATABASE_URL as last resort.
  if (neonUrl) {
    console.log(`[DB] Falling back to NEON_DATABASE_URL`);
    return neonUrl;
  }

  if (dbUrl) return dbUrl;
  if (pgUrl) return pgUrl;

  throw new Error(
    "No database URL found. Set DATABASE_URL, PG* vars, or NEON_DATABASE_URL.",
  );
}

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;
let _initPromise: Promise<void> | null = null;

async function initDb() {
  const connStr = await resolveDbUrl();
  const parsed = new URL(connStr);
  const isExternal = isExternalHost(parsed.hostname);
  
  _pool = new Pool({
    connectionString: connStr,
    connectionTimeoutMillis: 15000,
    max: 10,
    ssl: isExternal ? { rejectUnauthorized: false } : false,
  });

  _db = drizzle(_pool, { schema });

  try {
    const client = await _pool.connect();
    try {
      await client.query(`
        ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false
      `);
      console.log(`[DB] Schema migration check complete`);
    } catch (migErr: any) {
      console.log(`[DB] Migration note: ${migErr.message}`);
    }
    client.release();
    console.log(`[DB] Connection pool initialized successfully`);
  } catch (err: any) {
    console.error(`[DB] Initial connection test failed: ${err.message}`);
    console.log(`[DB] Pool created but initial connection failed - will retry on first query`);
  }
}

export async function ensureDb(): Promise<void> {
  if (!_initPromise) {
    _initPromise = initDb().catch((err) => {
      console.error(`[DB] initDb failed: ${err.message}`);
      _initPromise = null;
      throw err;
    });
  }
  return _initPromise;
}

export function getDb() {
  if (!_db) throw new Error("Database not initialized. Call ensureDb() first.");
  return _db;
}

export function getPool() {
  if (!_pool) throw new Error("Database not initialized. Call ensureDb() first.");
  return _pool;
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  await ensureDb();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isTransient = err?.code === 'EAI_AGAIN' || 
        err?.code === 'ECONNRESET' || 
        err?.code === 'ENOTFOUND' ||
        err?.code === 'ETIMEDOUT' ||
        err?.message?.includes('EAI_AGAIN') ||
        err?.message?.includes('Connection terminated');
      
      if (isTransient && attempt < retries) {
        const delay = attempt * 1000;
        console.log(`[DB RETRY] Attempt ${attempt}/${retries} failed (${err.code || err.message}), retrying in ${delay}ms...`);
        _initPromise = null;
        await ensureDb();
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}
