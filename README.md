# Ink & Wonder

A personal legacy blog for preserving memories, reflections, and wisdom for future generations. Built with React, Express, PostgreSQL, and Google Gemini AI.

The hero section randomly alternates between "Nani's Notebook" and "Dadi's Diary" on each page load. Writers simply type their thoughts and hit Publish -- AI automatically polishes the writing and generates all metadata (title, category, excerpt, read time).

## Features

- **Effortless writing**: Just write and publish. AI handles the rest.
- **AI-powered polish**: Fixes grammar, improves flow, preserves your voice and cultural expressions (Hindi/Hinglish)
- **Password-protected writing**: Public reading, private writing behind a simple password
- **Privacy toggle**: Mark any post as private (hidden from public visitors)
- **Date picker**: Backdate posts for older memories while maintaining chronological order
- **Auto-save drafts**: Writing is saved locally every 2 seconds
- **Editorial design**: Typography-first layout with four rotating blog card styles
- **Mobile responsive**: Optimized for writing and reading on phones
- **Social sharing**: Open Graph tags for rich previews on WhatsApp, Facebook, etc.

## Fork & Make It Your Own

### 1. Fork this repo

Click "Fork" on GitHub, or import into [Replit](https://replit.com).

### 2. Set up a PostgreSQL database

You need a PostgreSQL database. Options:
- **Replit**: Use the built-in PostgreSQL database (recommended if hosting on Replit)
- **Neon**: Create a free serverless database at [neon.tech](https://neon.tech)
- **Any PostgreSQL provider**: Supabase, Railway, etc.

The database schema is created automatically on first startup.

### 3. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key (free tier: 60 requests/minute)

### 4. Set environment variables

Create these environment variables (on Replit, use the Secrets tab):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `WRITER_PASSWORD` | Password to access the writing page |
| `SESSION_SECRET` | Any random string for signing cookies |

### 5. Install and run

```bash
npm install
npm run dev
```

The app runs on port 5000.

### 6. Customize

Things you'll likely want to change:

- **Site names**: Edit `client/src/lib/siteName.ts` to change the alternating hero names
- **Header title**: Edit `client/src/components/Header.tsx` (currently "Ink & Wonder")
- **Browser tab title**: Edit `client/index.html`
- **AI personality**: Edit the weave prompt in `server/ai.ts` to match your writer's voice
- **Hero subtitle**: Edit `client/src/components/Hero.tsx`
- **About page**: Edit `client/src/pages/about.tsx`
- **Hero image**: Replace `client/public/hero-illustration.png`

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Wouter
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **AI**: Google Gemini (gemini-2.5-pro for writing, gemini-2.5-flash for metadata)

## Project Structure

```
client/src/
  pages/          Home, About, Create, How-To, Not Found
  components/     Header, Hero, BlogCard, BlogPost, UI components
  lib/            Auth, query client, site name logic

server/
  routes.ts       API endpoints
  storage.ts      Database queries
  ai.ts           Gemini AI integration
  db.ts           Database connection

shared/
  schema.ts       Database schema + validation (shared between client & server)
```

## License

MIT
