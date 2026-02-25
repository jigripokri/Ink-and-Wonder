/**
 * seed-from-doc.mjs
 *
 * Parses the blog post document and creates each post via the app's API,
 * exactly as a user would — AI polishes the text and generates illustrations.
 *
 * Usage (from project root):
 *   node scripts/seed-from-doc.mjs
 *
 * Optional env overrides:
 *   BASE_URL=http://localhost:5000
 *   DOC_PATH=path/to/file.txt
 */

import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const DOC_PATH = process.env.DOC_PATH ||
  "attached_assets/Pasted-8-30-2025-Just-back-from-a-weeklong-vacation-with-famil_1772058354723.txt";
const PASSWORD = process.env.WRITER_PASSWORD;
const START_FROM = parseInt(process.env.START_FROM || "1"); // 1-indexed, skip posts before this

if (!PASSWORD) { console.error("Error: WRITER_PASSWORD not set."); process.exit(1); }

const MONTH_MAP = {
  jan: "January", feb: "February", mar: "March", apr: "April",
  may: "May", jun: "June", jul: "July", july: "July", aug: "August",
  sep: "September", sept: "September", oct: "October",
  nov: "November", dec: "December",
};
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

function parseDate(raw) {
  const s = raw.trim();

  // MM/DD/YYYY or M/D/YYYY
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, m, d, y] = slash;
    return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  }

  // "28 July 2022" or "5th feb 2024" or "28th Jan 2024" or "128 nOv 2023"
  // Pattern: number(s) + optional ordinal + whitespace + month + whitespace + year
  const wordy = s.match(/^(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/i);
  if (wordy) {
    let [, d, m, y] = wordy;
    const monthKey = m.toLowerCase().slice(0, 4);
    // Handle typo like "128" → clamp to 31
    let day = parseInt(d);
    if (day > 31) day = parseInt(d.toString().slice(0, 2));
    const monthName = MONTH_MAP[monthKey] || MONTH_MAP[m.toLowerCase().slice(0, 3)];
    if (monthName) return `${monthName} ${day}, ${y}`;
  }

  return null;
}

function isDateLine(line) {
  return parseDate(line) !== null;
}

function parsePosts(text) {
  // Normalise Windows line endings
  text = text.replace(/\r\n/g, "\n");

  // Split on separator lines containing only – or — or ---
  const blocks = text.split(/\n[ \t]*[–—-]{1,3}[ \t]*\n/);

  const posts = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    let dateStr = null;
    let contentStart = 0;

    // Scan first few lines for a date
    for (let i = 0; i < Math.min(lines.length, 4); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parsed = parseDate(line);
      if (parsed) {
        dateStr = parsed;
        contentStart = i + 1;
        break;
      }
      // If first non-empty line isn't a date, treat whole block as content
      break;
    }

    const content = lines
      .slice(contentStart)
      .join("\n")
      .trim();

    if (content.length < 10) continue;
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
  if (!cookie?.includes("writer_auth=authenticated"))
    throw new Error("Login failed — check WRITER_PASSWORD");
  return cookie.match(/writer_auth=[^;]+/)[0];
}

async function getAllPostIds(cookie) {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    headers: { Cookie: cookie },
  });
  const posts = await res.json();
  return posts.map((p) => p.id);
}

async function deletePost(cookie, id) {
  await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
}

async function createPost(cookie, post) {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ content: post.content, date: post.date }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const docText = fs.readFileSync(DOC_PATH, "utf-8");
  const posts = parsePosts(docText);

  console.log(`Parsed ${posts.length} post(s) from document.\n`);
  posts.forEach((p, i) =>
    console.log(`  [${i + 1}] ${p.date || "(no date)"} — ${p.content.substring(0, 55).replace(/\n/g, " ")}...`)
  );
  console.log();

  console.log("Logging in...");
  const cookie = await login();
  console.log("Logged in.\n");

  // Clear existing dev posts (only when starting from the beginning)
  if (START_FROM === 1) {
    const existingIds = await getAllPostIds(cookie);
    if (existingIds.length > 0) {
      process.stdout.write(`Clearing ${existingIds.length} existing dev post(s)... `);
      for (const id of existingIds) await deletePost(cookie, id);
      console.log("done.\n");
    }
  } else {
    console.log(`Resuming from post ${START_FROM} (skipping 1–${START_FROM - 1}).\n`);
  }

  // Create all posts
  let ok = 0, failed = 0;
  for (let i = 0; i < posts.length; i++) {
    const postNum = i + 1;
    if (postNum < START_FROM) continue;
    const post = posts[i];
    process.stdout.write(`[${i + 1}/${posts.length}] ${post.date || "no date"} ... `);
    try {
      const created = await createPost(cookie, post);
      console.log(`id=${created.id} "${created.title}"`);
      ok++;
      if (i < posts.length - 1) await sleep(1000);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${ok}, Failed: ${failed}`);
}

main().catch((err) => { console.error("Fatal:", err.message); process.exit(1); });
