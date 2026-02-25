/**
 * sync-to-prod.mjs
 *
 * Reads all posts from the dev database and imports them into production.
 *
 * Usage:
 *   node scripts/sync-to-prod.mjs
 *
 * Optional env overrides:
 *   PROD_URL=https://pratibhablog.replit.app   (default)
 *   WRITER_PASSWORD=yourpassword               (read from env)
 */

import pg from "pg";

const PROD_URL = process.env.PROD_URL || "https://pratibhablog.replit.app";
const PASSWORD = process.env.WRITER_PASSWORD;
const DEV_DB_URL = process.env.DATABASE_URL;

if (!PASSWORD) {
  console.error("Error: WRITER_PASSWORD env variable is not set.");
  process.exit(1);
}

if (!DEV_DB_URL) {
  console.error("Error: DATABASE_URL env variable is not set.");
  process.exit(1);
}

async function readDevPosts() {
  const pool = new pg.Pool({ connectionString: DEV_DB_URL });
  try {
    const result = await pool.query(
      "SELECT id, title, excerpt, content, category, read_time, date, is_private, created_at, updated_at FROM blog_posts ORDER BY created_at ASC"
    );
    return result.rows.map((r) => ({
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

async function loginToProd() {
  const res = await fetch(`${PROD_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie || !setCookie.includes("writer_auth=authenticated")) {
    throw new Error("Login failed — check WRITER_PASSWORD");
  }
  const match = setCookie.match(/writer_auth=[^;]+/);
  return match ? match[0] : null;
}

async function importBatch(batch, cookie) {
  const res = await fetch(`${PROD_URL}/api/admin/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Import request failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function importToProd(posts, cookie) {
  const BATCH_SIZE = 5;
  let totalImported = 0, totalFailed = 0;
  const allErrors = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const from = i + 1, to = Math.min(i + BATCH_SIZE, posts.length);
    process.stdout.write(`  Batch ${from}–${to} ... `);
    const result = await importBatch(batch, cookie);
    console.log(`imported=${result.imported} failed=${result.failed}`);
    totalImported += result.imported || 0;
    totalFailed += result.failed || 0;
    if (result.errors?.length) allErrors.push(...result.errors);
  }
  return { imported: totalImported, failed: totalFailed, errors: allErrors };
}

async function main() {
  console.log("Reading posts from dev database...");
  const posts = await readDevPosts();
  console.log(`Found ${posts.length} post(s) in dev.`);

  if (posts.length === 0) {
    console.log("Nothing to sync.");
    return;
  }

  console.log(`Logging into production (${PROD_URL})...`);
  const cookie = await loginToProd();
  console.log("Logged in.");

  console.log(`Importing ${posts.length} post(s) to production...`);
  const result = await importToProd(posts, cookie);
  console.log(`Done. Imported: ${result.imported}, Failed: ${result.failed}`);
  if (result.errors?.length) {
    console.error("Errors:", result.errors);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
