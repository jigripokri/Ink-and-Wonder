# Ink & Wonder - Personal Legacy Blog

## Overview

A personal blog for preserving memories, reflections, and wisdom for future generations. The hero section randomly alternates between "Nani's Notebook" and "Dadi's Diary" (50/50 on each page load). The header and browser tab show "Ink & Wonder".

Writers simply type their thoughts and hit Publish. AI automatically polishes the writing and generates title, category, excerpt, and read time. A password protects writing access while reading is public.

## User Preferences

- Communication style: Simple, everyday language
- No emojis in UI (use Lucide icons instead)
- Typography-first editorial design with generous whitespace
- **CRITICAL: NEVER write any script, migration, or startup code that deletes, truncates, or bulk-removes blog posts. Post data is irreplaceable. The only allowed deletion is the single-post DELETE /api/posts/:id endpoint triggered by the authenticated user.**

## Recent Changes (February 18, 2026)

- **Illustrations persisted to Object Storage**: Illustrations now upload to Replit Object Storage instead of local filesystem, surviving redeployments
- **Illustration serving route**: `GET /illustrations/:filename` serves from object storage with immutable cache headers
- **Migration endpoint**: `POST /api/illustrations/migrate` (auth required) migrates local filesystem illustrations to object storage
- **All 68 production posts regenerated**: Every post now has a persistent illustration in object storage
- **AI illustration generation**: Uses Gemini 2.5 Flash Image model with 3-attempt retry logic, RK Laxman ink style, 300x300px

## Earlier Changes (February 14, 2026)

- **Site renamed**: Header and tab title now show "Ink & Wonder"; hero still alternates Nani/Dadi
- **Date picker on write page**: Minimal calendar icon in stats bar; defaults to today, tap to change for backdating old posts
- **Posts sorted by date**: Home page shows most recent post date first (not creation timestamp), so backdated posts appear in correct chronological order
- **Fixed post deletion bug**: Removed startup cleanup script that was deleting all but the latest post on every deployment
- **Mobile improvements**: Compact hero on mobile, single-line stats bar, responsive textarea (60vh)
- **Write button**: Prominent button with pen icon in header; switches to outline style when on write page

## Architecture

### Stack
- **Frontend**: React 18 + TypeScript, Vite, Wouter (routing), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Express.js + TypeScript, Drizzle ORM, PostgreSQL
- **Storage**: Replit Object Storage (illustrations persist across deployments)
- **AI**: Google Gemini API (gemini-2.5-pro for weave, gemini-2.5-flash for metadata, gemini-2.5-flash-image for illustrations)

### Key Files
- `shared/schema.ts` - Database schema and Zod validation (single source of truth)
- `server/routes.ts` - All API endpoints including illustration serving and migration
- `server/storage.ts` - Database queries via Drizzle ORM
- `server/ai.ts` - Gemini AI integration (weave prompt, metadata generation, illustration generation via object storage)
- `server/db.ts` - Database connection with retry logic
- `server/replit_integrations/object_storage/` - Object storage client, ACL, and routes
- `client/src/pages/home.tsx` - Home page with post grid, search, filters
- `client/src/pages/create.tsx` - Writing page with auto-save, AI weave, date picker
- `client/src/components/Hero.tsx` - Alternating Nani/Dadi hero section
- `client/src/components/Header.tsx` - Site header with navigation
- `client/src/components/BlogCard.tsx` - Four rotating card variants
- `client/src/components/BlogPost.tsx` - Full post view with edit/delete/privacy controls, illustration display
- `client/src/lib/auth.ts` - Password authentication (cookie-based, 180-day session)
- `client/src/lib/siteName.ts` - Random 50/50 name selection

### API Endpoints
- `GET /api/posts` - All posts (public only for visitors, all for authenticated)
- `GET /api/posts/:id` - Single post (404 for private posts if unauthenticated)
- `POST /api/posts` - Create post (auth required, only `content` needed; accepts optional `date`)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/ai/enhance` - AI text enhancement
- `POST /api/auth/login` - Password login
- `GET /api/auth/status` - Auth status check
- `POST /api/auth/logout` - Logout
- `PATCH /api/posts/:id/privacy` - Toggle post privacy
- `POST /api/posts/:id/illustration` - Regenerate illustration for a post (auth required)
- `GET /illustrations/:filename` - Serve illustration from object storage (public, immutable cache)
- `POST /api/illustrations/migrate` - Migrate local filesystem illustrations to object storage (auth required)

### Database Schema (blog_posts)
- `id` (integer, auto-increment)
- `title`, `excerpt`, `content`, `category` (text)
- `readTime`, `date` (text, nullable)
- `isPrivate` (boolean, default false)
- `createdAt`, `updatedAt` (timestamps)

### Illustrations
- Stored in Replit Object Storage under `public/illustrations/post-{id}.png`
- Generated by Gemini 2.5 Flash Image model with RK Laxman ink style
- 300x300px, trimmed and resized via sharp
- 3-attempt retry with exponential backoff (5s, 10s, 15s delays)
- Auto-generated on post creation; can be regenerated via UI button or API
- Layout: 5+ paragraphs = floated illustration with text wrap; <5 paragraphs = centered
- Style: Symbolic objects/scenes (not person-focused), black ink on white, no text/labels

### Production
- **URL**: https://pratibhablog.replit.app

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `WRITER_PASSWORD` - Password for write access
- `SESSION_SECRET` - Cookie signing secret
- `PUBLIC_OBJECT_SEARCH_PATHS` - Object storage public paths (set by Replit)
- `PRIVATE_OBJECT_DIR` - Object storage private directory (set by Replit)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` - Object storage bucket ID (set by Replit)

### AI Behavior
- **Auto-weave on publish**: Polishes grammar, flow, and structure while preserving voice, Hindi/Hinglish phrases, and Indian cultural references
- **Metadata generation**: AI creates title (3-6 words, conversational), category (1-2 words), excerpt (15-25 words), read time
- **Illustration generation**: AI creates RK Laxman-style ink illustration, uploaded to object storage
- **Graceful fallback**: If AI fails, publishes original text with heuristic metadata; illustration returns null
- **Banned title words**: "embrace", "unlock", "journey", "tapestry", "wisdom", "cherish", "navigating", "illuminating"

### Post Sorting
- Posts sorted by user-facing `date` field (parsed via `TO_DATE`), most recent first
- Falls back to `createdAt` timestamp if `date` is null
