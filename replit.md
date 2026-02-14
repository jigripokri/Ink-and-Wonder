# Nani's Notebook / Dadi's Diary - Personal Legacy Blog

## Overview

A typography-first personal blog application designed for a grandmother (Dr Pratibha Verma) to share life wisdom, memories, and reflections with future generations. The site name randomly alternates between "Nani's Notebook" and "Dadi's Diary" on each page load (50/50 chance). The application features an elegant editorial design with generous whitespace, ornamental flourishes, and AI-powered writing assistance to help users craft and refine their stories.

**Simplified Writing Experience**: Users simply write their thoughts in a single textarea. AI automatically generates the title, category, excerpt, date, and read time - making it effortless to preserve memories without worrying about structure or metadata.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (February 13, 2026)

### Private Posts Feature
- **Privacy toggle**: Eye/EyeOff button on post view (next to delete, auth-only)
- **PATCH /api/posts/:id/privacy**: Toggles isPrivate boolean, requires auth
- **Filtered listing**: GET /api/posts returns all posts for auth users, only public for visitors
- **Access control**: GET /api/posts/:id returns 404 for private posts to unauthenticated users
- **OG tag protection**: Private posts don't get OG meta tags injected for unauthenticated requests
- **Visual indicators**: "Private" badge on post view, small EyeOff icon on blog cards
- **Default**: All posts are public by default (isPrivate: false)

### MVP Polish Pass - COMPLETE

**Writing Page Redesign**
- **Clean background**: Removed dark wood desk gradient, now matches home page
- **Paper card**: Cream-colored (#faf9f7) with softened shadow for subtle depth
- **Semantic colors**: All hardcoded stone/amber colors replaced with design tokens
- **Georgia serif typography**: 24px font size with 2.0 line-height

**Simplified AI (Single Action, Automatic)**
- **No manual buttons**: AI toolbar removed entirely, no user interaction needed
- **Auto-weave on publish**: When the user clicks Publish, AI automatically polishes their writing — fixing grammar, organizing flow, and preserving voice — all in one pass
- **Single comprehensive prompt**: Handles grammar, structure, tone, and cultural context (Hindi/Hinglish preservation, Indian cultural references)
- **Smart length matching**: Short thoughts stay concise, longer pieces get proper structure
- **Writer-specific**: Prompt is tailored to Pratibha (grandmother writing for grandchildren)
- Backend has single `weave` prompt (grammar action deprecated, all calls route to weave)

**Edit Flow**
- Edit button on published posts links to `/create?edit=ID`
- Create page detects edit param, fetches post, loads content
- Shows "Update" button instead of "Publish" in edit mode
- Uses PUT `/api/posts/:id` for updates
- Auto-save disabled in edit mode to preserve user drafts
- Error state shown if post not found

**Delete Posts**
- Delete button added to post view (next to Edit)
- Confirmation dialog before deletion
- Cache invalidated after delete

**UI/UX Fixes**
- **Brand consistency**: Header uses dynamic "Nani's Notebook" / "Dadi's Diary" naming
- **Glass hero**: Added `.glass-hero` CSS class for subtle hero background
- **404 page**: Friendly user-facing message with fleuron decoration
- **How-To guide**: Fully rewritten for current AI (2 actions, no selection, no focus mode)
- **No emojis**: Replaced all emoji with Lucide icons throughout

**Console Logging**
- Color-coded console logging for all Gemini API requests
- Each request logs: action type, user input preview, system prompt, AI response preview, duration

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing (Home, About, Create pages)
- **Tailwind CSS** with custom design system for typography-first styling

**State Management & Data Fetching**
- **TanStack React Query** for server state management and caching
- Custom query client configured with infinite stale time and disabled auto-refetching
- Optimistic updates disabled in favor of explicit refetching

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives
- Custom theming system using CSS variables for light/dark mode support
- **Framer Motion** for animations (staggered card reveals, layout transitions, hover effects)

**Design System**
- Typography-first approach with 18px base font size
- Near-white background (#fefefe) with deep charcoal text (#1a1a1a)
- Four rotating blog card variants (Large Number, Centered Elegant, Quote Style, Sidebar Accent)
- Custom spacing scale and container max-widths for different content types
- Ornamental flourishes using fleuron symbols (❦)

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- ESM module system throughout the codebase
- Custom middleware for request logging and JSON response capture

**API Design**
- RESTful endpoints under `/api` namespace:
  - `GET /api/posts` - Retrieve all blog posts
  - `GET /api/posts/:id` - Retrieve single post by ID
  - `POST /api/posts` - Create new post (requires only `content`, AI auto-generates all metadata)
  - `PUT /api/posts/:id` - Update existing post
  - `DELETE /api/posts/:id` - Remove post
  - `POST /api/ai/enhance` - AI text enhancement endpoint

**Data Layer**
- **Drizzle ORM** for type-safe database interactions
- Schema-first approach with Zod validation
- Database abstraction through storage interface (`IStorage`)
- Automatic timestamp tracking (createdAt, updatedAt)

### Database Schema

**Tables**
- `users` - User authentication (id, username, password)
- `blog_posts` - Blog content storage:
  - Auto-incrementing integer ID
  - Title, excerpt, content (text fields)
  - Category and readTime metadata
  - Date string for display
  - Created/updated timestamps

**ORM Configuration**
- PostgreSQL dialect via Neon serverless driver
- WebSocket support for Neon connections
- Migration files stored in `/migrations` directory
- Schema definitions in shared module for client/server reuse

### AI Integration

**Google Gemini Integration**
- **Google Generative AI SDK** with dual-model setup:
  - **gemini-2.5-pro** for Weave (highest quality text transformation)
  - **gemini-2.5-flash** for Grammar, metadata generation (fast and efficient)
- Two focused enhancement modes:
  - **Grammar** - Fix mechanics while maintaining voice (Flash)
  - **Weave** - Transform stream-of-consciousness into coherent blog posts (Pro)

**AI Assistant Features**
- Prompts emphasize preserving the writer's personality and voice
- Both actions work on entire text (no text selection)
- Undo support to revert AI changes
- **Automatic Metadata Generation**: AI generates title, category, and excerpt from content
  - `generateAllMetadata()` - Single API call that creates:
    - Title: 4-8 words, warm and inviting
    - Category: 1-2 words (e.g., "Family", "Wisdom", "Daily Life")
    - Excerpt: 15-25 words, compelling summary
    - Read time: Calculated from word count
- Graceful fallbacks when AI is unavailable (uses heuristics)

### Development Tooling

**Type Safety**
- Shared schema between client and server via `@shared` alias
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)
- Strict TypeScript configuration with ESNext module resolution

**Development Features**
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- Hot module replacement via Vite
- Automatic restart on server changes
- Custom logging with formatted timestamps

**Build Process**
- Client bundle via Vite to `dist/public`
- Server bundle via esbuild to `dist/index.js`
- External package handling for Node.js runtime
- Production-ready output with ESM format

## External Dependencies

### Database
- **Neon Serverless PostgreSQL** - Managed PostgreSQL with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Requires `DATABASE_URL` environment variable

### AI Services
- **Google Gemini API** - Generative AI for text enhancement and metadata generation
- Model: gemini-2.5-flash (upgraded from retired gemini-1.5-flash)
- Requires `GEMINI_API_KEY` environment variable
- Used for: text enhancement, title generation, category generation, excerpt generation

### Third-Party Libraries
- **Radix UI** - Headless UI component primitives (20+ components)
- **Framer Motion** - Animation library for React
- **date-fns** - Date manipulation and formatting
- **Zod** - Runtime type validation and schema parsing
- **React Hook Form** with Resolvers - Form state management
- **class-variance-authority** & **clsx** - Utility-first styling helpers

### Development Dependencies
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast JavaScript bundler
- **drizzle-kit** - Database migration toolkit
- **PostCSS** with Autoprefixer - CSS processing