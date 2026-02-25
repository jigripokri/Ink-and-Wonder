/**
 * seed-from-doc.mjs
 *
 * Parses the blog post document and creates each post via the app's API,
 * exactly as a user would — AI polishes the text, generates title/excerpt/
 * category, and creates an illustration for each post.
 *
 * Usage (from project root):
 *   node scripts/seed-from-doc.mjs
 *
 * Optional env overrides:
 *   BASE_URL=http://localhost:5000   (default)
 *   DOC_PATH=path/to/file.txt        (default: attached_assets/...)
 */

import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const DOC_PATH = process.env.DOC_PATH ||
  "attached_assets/Pasted-8-30-2025-Just-back-from-a-weeklong-vacation-with-famil_1772056095162.txt";
const PASSWORD = process.env.WRITER_PASSWORD;

if (!PASSWORD) {
  console.error("Error: WRITER_PASSWORD env variable is not set.");
  process.exit(1);
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function parseDate(raw) {
  const match = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, m, d, y] = match;
  return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

function parsePosts(text) {
  const posts = [];
  // Split on separator lines (–, —, or just dashes)
  const blocks = text.split(/\n\s*[–—-]{1,3}\s*\n/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    let dateStr = null;
    let contentStart = 0;

    // First non-empty line might be a date
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parsed = parseDate(line);
      if (parsed) {
        dateStr = parsed;
        contentStart = i + 1;
      }
      break;
    }

    const content = lines
      .slice(contentStart)
      .join("\n")
      .trim();

    if (content.length < 10) continue; // skip empty or near-empty blocks

    posts.push({ date: dateStr, content });
  }

  return posts;
}

async function login() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const cookie = res.headers.get("set-cookie");
  if (!cookie?.includes("writer_auth=authenticated")) {
    throw new Error("Login failed — check WRITER_PASSWORD");
  }
  return cookie.match(/writer_auth=[^;]+/)[0];
}

async function createPost(cookie, post) {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      content: post.content,
      date: post.date,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const docText = fs.readFileSync(DOC_PATH, "utf-8");
  const posts = parsePosts(docText);

  console.log(`Found ${posts.length} post(s) to create.\n`);
  posts.forEach((p, i) => {
    console.log(`  [${i + 1}] ${p.date || "(no date)"} — ${p.content.substring(0, 60).replace(/\n/g, " ")}...`);
  });
  console.log();

  console.log("Logging in...");
  const cookie = await login();
  console.log("Logged in.\n");

  let ok = 0;
  let failed = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    process.stdout.write(`[${i + 1}/${posts.length}] Creating post (${post.date || "no date"})... `);
    try {
      const created = await createPost(cookie, post);
      console.log(`done — id=${created.id} title="${created.title}"`);
      ok++;
      // Small pause to avoid overwhelming the AI API
      if (i < posts.length - 1) await sleep(2000);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${ok}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
