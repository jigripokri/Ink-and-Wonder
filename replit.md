# Ink & Wonder - Personal Legacy Blog

## Overview

A personal blog for preserving memories, reflections, and wisdom for future generations. The hero section randomly alternates between "Nani's Notebook" and "Dadi's Diary" (50/50 on each page load). The header and browser tab show "Ink & Wonder".

Writers simply type their thoughts and hit Publish. AI automatically polishes the writing and generates title, category, excerpt, and read time. A password protects writing access while reading is public.

## User Preferences

- Communication style: Simple, everyday language
- No emojis in UI (use Lucide icons instead)
- Typography-first editorial design with generous whitespace
- **CRITICAL: NEVER write any script, migration, or startup code that deletes, truncates, or bulk-removes blog posts. Post data is irreplaceable. The only allowed deletion is the single-post DELETE /api/posts/:id endpoint triggered by the authenticated user.**

## Recent Changes (February 14, 2026)

- **Site renamed**: Header and tab title now show "Ink & Wonder"; hero still alternates Nani/Dadi
- **Date picker on write page**: Minimal calendar icon in stats bar; defaults to today, tap to change for backdating old posts
- **Posts sorted by date**: Home page shows most recent post date first (not creation timestamp), so backdated posts appear in correct chronological order
- **Secrets cleanup**: Removed DEPLOYMENT.md and PROJECT_DOSSIER.md that contained exposed credentials
- **Fixed post deletion bug**: Removed startup cleanup script that was deleting all but the latest post on every deployment
- **Mobile improvements**: Compact hero on mobile, single-line stats bar, responsive textarea (60vh)
- **Write button**: Prominent button with pen icon in header; switches to outline style when on write page

## Architecture

### Stack
- **Frontend**: React 18 + TypeScript, Vite, Wouter (routing), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Express.js + TypeScript, Drizzle ORM, PostgreSQL
- **AI**: Google Gemini API (gemini-2.5-pro for weave, gemini-2.5-flash for metadata)

### Key Files
- `shared/schema.ts` - Database schema and Zod validation (single source of truth)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database queries via Drizzle ORM
- `server/ai.ts` - Gemini AI integration (weave prompt, metadata generation)
- `server/db.ts` - Database connection with retry logic
- `client/src/pages/home.tsx` - Home page with post grid, search, filters
- `client/src/pages/create.tsx` - Writing page with auto-save, AI weave, date picker
- `client/src/components/Hero.tsx` - Alternating Nani/Dadi hero section
- `client/src/components/Header.tsx` - Site header with navigation
- `client/src/components/BlogCard.tsx` - Four rotating card variants
- `client/src/components/BlogPost.tsx` - Full post view with edit/delete/privacy controls
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
- `GET /api/auth/check` - Auth status check
- `PATCH /api/posts/:id/privacy` - Toggle post privacy

### Database Schema (blog_posts)
- `id` (integer, auto-increment)
- `title`, `excerpt`, `content`, `category` (text)
- `readTime`, `date` (text, nullable)
- `isPrivate` (boolean, default false)
- `createdAt`, `updatedAt` (timestamps)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `WRITER_PASSWORD` - Password for write access
- `SESSION_SECRET` - Cookie signing secret

### AI Behavior
- **Auto-weave on publish**: Polishes grammar, flow, and structure while preserving voice, Hindi/Hinglish phrases, and Indian cultural references
- **Metadata generation**: AI creates title (4-8 words), category (1-2 words), excerpt (15-25 words), read time
- **Graceful fallback**: If AI fails, publishes original text with heuristic metadata

### Post Sorting
- Posts sorted by user-facing `date` field (parsed via `TO_DATE`), most recent first
- Falls back to `createdAt` timestamp if `date` is null
