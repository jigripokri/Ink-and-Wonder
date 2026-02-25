/**
 * sync-to-prod.mjs
 *
 * 1. Reads all posts from the dev database
 * 2. Imports them into production via /api/admin/import (returns id mappings)
 * 3. Copies illustrations in object storage from post-{devId}.png → post-{prodId}.png
 *
 * Usage:
 *   node scripts/sync-to-prod.mjs
 *
 * Optional env overrides:
 *   PROD_URL=https://pratibhablog.replit.app   (default)
 *   WRITER_PASSWORD=yourpassword               (read from env)
 */

import pg from "pg";
import { Storage } from "@google-cloud/storage";

const PROD_URL = process.env.PROD_URL || "https://pratibhablog.replit.app";
const PASSWORD = process.env.WRITER_PASSWORD;
const DEV_DB_URL = process.env.DATABASE_URL;
const SIDECAR = "http://127.0.0.1:1106";

if (!PASSWORD) { console.error("Error: WRITER_PASSWORD env variable is not set."); process.exit(1); }
if (!DEV_DB_URL) { console.error("Error: DATABASE_URL env variable is not set."); process.exit(1); }

// ── Object storage client (uses Replit sidecar, dev environment only) ──────────
const gcsClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${SIDECAR}/token`,
    type: "external_account",
    credential_source: {
      url: `${SIDECAR}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function getBucketName() {
  const searchPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",");
  for (const p of searchPaths) {
    const trimmed = p.trim();
    if (trimmed) {
      const parts = trimmed.replace(/^\//, "").split("/");
      return parts[0]; // /{bucketName}/public → bucketName
    }
  }
  throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set — cannot find bucket name.");
}

async function copyIllustration(bucketName, devId, prodId) {
  const bucket = gcsClient.bucket(bucketName);
  const src = bucket.file(`public/illustrations/post-${devId}.png`);
  const [exists] = await src.exists();
  if (!exists) {
    console.log(`    (no illustration for dev post ${devId}, skipping)`);
    return false;
  }
  const dst = bucket.file(`public/illustrations/post-${prodId}.png`);
  await src.copy(dst);
  return true;
}

// ── Dev database ───────────────────────────────────────────────────────────────
async function readDevPosts() {
  const pool = new pg.Pool({ connectionString: DEV_DB_URL });
  try {
    const result = await pool.query(
      "SELECT id, title, excerpt, content, category, read_time, date, is_private, created_at, updated_at FROM blog_posts ORDER BY created_at ASC"
    );
    return result.rows.map((r) => ({
      devId: r.id,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      category: r.category,
      readTime: r.read_time,
      date: r.date,
      isPrivate: r.is_private,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } finally {
    await pool.end();
  }
}

// ── Production API ─────────────────────────────────────────────────────────────
async function loginToProd() {
  const res = await fetch(`${PROD_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie?.includes("writer_auth=authenticated")) {
    throw new Error("Login failed — check WRITER_PASSWORD");
  }
  return setCookie.match(/writer_auth=[^;]+/)[0];
}

async function importBatch(batch, cookie) {
  const res = await fetch(`${PROD_URL}/api/admin/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Import failed (${res.status}): ${text.substring(0, 200)}`);
  }
  const json = await res.json();
  if (typeof json !== "object" || !("imported" in json)) {
    throw new Error(`Unexpected response: ${JSON.stringify(json).substring(0, 200)}`);
  }
  return json;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Reading posts from dev database...");
  const posts = await readDevPosts();
  console.log(`Found ${posts.length} post(s) in dev.\n`);

  if (posts.length === 0) { console.log("Nothing to sync."); return; }

  console.log(`Logging into production (${PROD_URL})...`);
  const cookie = await loginToProd();
  console.log("Logged in.\n");

  // ── Step 1: Import posts in batches ─────────────────────────────────────────
  const BATCH_SIZE = 5;
  let totalImported = 0, totalFailed = 0;
  const allMappings = [];
  const allErrors = [];

  console.log("Importing posts...");
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const from = i + 1, to = Math.min(i + BATCH_SIZE, posts.length);
    process.stdout.write(`  Posts ${from}–${to} ... `);
    try {
      const result = await importBatch(batch, cookie);
      console.log(`imported=${result.imported} failed=${result.failed}`);
      totalImported += result.imported || 0;
      totalFailed += result.failed || 0;
      if (result.idMappings?.length) allMappings.push(...result.idMappings);
      if (result.errors?.length) allErrors.push(...result.errors);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      totalFailed += batch.length;
    }
  }

  console.log(`\nImport done. Imported: ${totalImported}, Failed: ${totalFailed}`);
  if (allErrors.length) console.error("Errors:", allErrors);

  // ── Step 2: Copy illustrations ───────────────────────────────────────────────
  if (allMappings.length === 0) {
    console.log("\nNo ID mappings returned — skipping illustration copy.");
    console.log("(Ensure production is running the latest code with the updated import endpoint)");
    return;
  }

  console.log(`\nCopying ${allMappings.length} illustration(s) in object storage...`);
  let bucketName;
  try {
    bucketName = getBucketName();
    console.log(`  Bucket: ${bucketName}`);
  } catch (e) {
    console.error(`  Cannot copy illustrations: ${e.message}`);
    return;
  }

  let copied = 0, skipped = 0;
  for (const { devId, prodId } of allMappings) {
    process.stdout.write(`  post-${devId}.png → post-${prodId}.png ... `);
    try {
      const ok = await copyIllustration(bucketName, devId, prodId);
      if (ok) { console.log("copied"); copied++; }
      else { console.log("no source"); skipped++; }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\nIllustrations: copied=${copied}, skipped/missing=${skipped}`);
  console.log("\nAll done! Production is ready.");
}

main().catch((err) => { console.error("Error:", err.message); process.exit(1); });
