/**
 * regen-all-illustrations.mjs
 *
 * Regenerates illustrations for all posts on a given server.
 *
 * Usage (run in project root):
 *   node scripts/regen-all-illustrations.mjs                  # dev
 *   PROD_URL=https://pratibhablog.replit.app node scripts/regen-all-illustrations.mjs  # prod
 *
 * Optional:
 *   START_FROM=<post_id>  Skip posts with id < this value (for resuming)
 *   DELAY_MS=8000         Delay between requests (default 8000ms)
 */

const BASE_URL = process.env.PROD_URL || "http://localhost:5000";
const PASSWORD = process.env.WRITER_PASSWORD;
const START_FROM_ID = parseInt(process.env.START_FROM || "0");
const DELAY_MS = parseInt(process.env.DELAY_MS || "8000");

if (!PASSWORD) { console.error("Error: WRITER_PASSWORD not set."); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const cookie = res.headers.get("set-cookie")?.match(/writer_auth=[^;]+/)?.[0];
  if (!cookie) throw new Error("Login failed");
  return cookie;
}

async function getPosts(cookie) {
  const res = await fetch(`${BASE_URL}/api/posts`, { headers: { Cookie: cookie } });
  return res.json();
}

async function regenIllustration(cookie, postId) {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/illustration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log(`Regenerating illustrations on: ${BASE_URL}`);
  const cookie = await login();
  console.log("Logged in.\n");

  const posts = await getPosts(cookie);
  const targets = posts
    .filter(p => p.id >= START_FROM_ID)
    .sort((a, b) => a.id - b.id);

  console.log(`Found ${posts.length} total posts. Regenerating ${targets.length}.\n`);

  let ok = 0, failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const post = targets[i];
    process.stdout.write(`[${i + 1}/${targets.length}] id=${post.id} "${post.title}" ... `);
    try {
      const result = await regenIllustration(cookie, post.id);
      console.log(`done (${result.illustrationUrl})`);
      ok++;
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      failed++;
    }
    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. OK: ${ok}, Failed: ${failed}`);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
