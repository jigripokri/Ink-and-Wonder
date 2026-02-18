#!/bin/bash
#
# Generate illustrations for all blog posts on a given site.
# Usage: ./scripts/generate-all-illustrations.sh <site-url>
# Example: ./scripts/generate-all-illustrations.sh https://your-app.replit.app
#          ./scripts/generate-all-illustrations.sh http://localhost:5000

SITE_URL="${1:-http://localhost:5000}"
SITE_URL="${SITE_URL%/}"

echo "=== Generating illustrations for all posts at $SITE_URL ==="

COOKIE_JAR=$(mktemp)
trap "rm -f $COOKIE_JAR" EXIT

LOGIN_RESULT=$(curl -s -X POST "$SITE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"password\":\"$WRITER_PASSWORD\"}" \
  -c "$COOKIE_JAR")

if ! echo "$LOGIN_RESULT" | grep -q '"authenticated":true'; then
  echo "ERROR: Login failed. Check WRITER_PASSWORD env var."
  echo "Response: $LOGIN_RESULT"
  exit 1
fi
echo "Authenticated successfully."

POST_IDS=$(curl -s -b "$COOKIE_JAR" "$SITE_URL/api/posts" | \
  node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{const posts=JSON.parse(d.join(''));posts.forEach(p=>console.log(p.id))}catch(e){console.error('Failed to parse posts')}})")

if [ -z "$POST_IDS" ]; then
  echo "No posts found."
  exit 0
fi

TOTAL=$(echo "$POST_IDS" | wc -l)
CURRENT=0

for POST_ID in $POST_IDS; do
  CURRENT=$((CURRENT + 1))
  echo ""
  echo "[$CURRENT/$TOTAL] Post $POST_ID: generating illustration..."
  RESULT=$(curl -s -X POST -b "$COOKIE_JAR" "$SITE_URL/api/posts/$POST_ID/illustration" \
    --max-time 120)

  if echo "$RESULT" | grep -q '"illustrationUrl"'; then
    URL=$(echo "$RESULT" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>console.log(JSON.parse(d.join('')).illustrationUrl))")
    echo "  Done: $URL"
  else
    echo "  Failed: $RESULT"
  fi

  if [ "$CURRENT" -lt "$TOTAL" ]; then
    echo "  Waiting 5s before next..."
    sleep 5
  fi
done

echo ""
echo "=== All done! Generated illustrations for $TOTAL posts. ==="
