# Words Worth - Personal Legacy Blog Design Guidelines

## Core Design Philosophy
Typography-first editorial design with generous whitespace, ornamental flourishes, and refined interactions. Text-only aesthetic (no images) focusing on the beauty of written word and legacy storytelling.

## Visual System

### Color Palette
```
Background: #fefefe (near-white)
Foreground: #1a1a1a (deep charcoal text)
Card: #ffffff (pure white cards)
Primary: #2a2a2a (emphasis)
Secondary: #f5f5f5 (light backgrounds)
Muted: #fafafa (subtle backgrounds)
Muted-foreground: #737373 (secondary text)
Accent: #e5e5e5 (hover states)
Border: rgba(0, 0, 0, 0.08) (subtle)
```

### Typography
- **Base Size:** 18px for enhanced readability
- **Families:** System font stack + Georgia serif for ornaments
- **Scale:** h1: 64-72px | h2: 48px | h3: 30px | Body: 18px (1.75 line-height)
- **Weights:** 300 (light), 400 (normal), 500 (medium)
- **Special Features:** Drop caps (4.5rem first letter), Pull quotes (2xl-3xl italic), Ornamental dividers (❦ fleuron)

### Spacing
Tailwind units: 2, 4, 6, 8, 10, 12, 16, 20, 24, 32
- Container max-widths: Header (80rem), Hero (64rem), Blog Grid (72rem), Article (48rem)
- Consistent vertical rhythm: py-8 to py-32 for sections

## Component Library

### Header (Sticky)
- Backdrop blur with border-bottom
- Logo: "Ideas & Musings" (2xl) + "A Personal Journal" (xs uppercase, tracking-widest)
- Navigation: Home, About, Create Post (admin only)
- Interactive underline animation with layoutId transition

### Blog Cards (4 Rotating Variants)
1. **Large Number Minimal:** Background number (8rem, opacity-10), category, title (3xl), excerpt, footer with date/read time
2. **Centered Elegant:** Centered layout, ornament ❦, bordered with generous padding (p-12)
3. **Quote Style:** Large quote mark (6xl serif), italic title, minimal footer
4. **Sidebar Accent:** Left border accent (w-1, grows to w-2 on hover), pl-10 content

All cards: border, hover translateY(-4px), border-foreground/20 on hover, staggered fade-in animations

### Blog Post View
- Back button (ghost variant)
- Header: Category badge → Title (5xl-6xl) → Meta (date · read time)
- Ornamental divider (❦)
- Content: Drop cap on first paragraph, pull quote at midpoint (extracted from content), 1.125rem body text with 90% opacity
- Staggered paragraph animations (50ms delay each)

### Admin Writing Interface (NEW)
- **Rich Text Editor:** Simple, distraction-free interface matching editorial aesthetic
- **AI Assistant Panel:** Right sidebar (hidden until used) with 5 primary actions:
  1. **Polish My Words** - Refine writing while maintaining voice
  2. **Make It Shorter** - Condense without losing meaning  
  3. **Tell Me More** - Elaborate and expand ideas
  4. **Strengthen This Point** - Enhance specific arguments
  5. **Fix My Grammar** - Clean up mechanics
- **MAGIC Button: "Weave My Thoughts"** - Prominent, centered at top of editor
  - Gold/warm accent color (breaks color palette for emphasis)
  - Larger than other buttons (px-8, py-4)
  - Takes stream-of-consciousness input and transforms into polished blog post
  - Loading state with gentle pulse animation
- **Action Button Styling:** Ghost variant, muted-foreground, grouped logically, tooltip descriptions
- **Live Preview:** Side-by-side or toggle view matching final blog post rendering

### About Page
- Center ornament + title (5xl-6xl) + subtitle
- 3-column feature grid: "From the Heart", "Ideas & Insights", "Life Lessons" (large numbers 01-03, opacity-20)
- Welcome card with border, drop cap, centered content

### Hero Section
- Ornament ❦ (4xl, muted/40)
- "Words Worth Remembering" (6xl-7xl, tight tracking, line breaks)
- Subtitle explaining legacy purpose
- Decorative divider (lines + dot)

## Interactions & Animations

### Hover States
- Cards: translateY(-4px), border intensifies, 300ms ease-out
- Navigation: translateY(-1px), color change, animated underline
- Ornaments: opacity increases (40→60%)

### Animations
- Page entrance: opacity 0→1, y-offset 10-30px
- Card grid: Sequential appearance, index × 50ms delay
- Paragraphs: Staggered fade-in
- Pull quotes: Slide from left with 500ms delay
- AI processing: Subtle pulse on Magic button, smooth content replacement

### Transitions
- Standard: 300ms
- Page-level: 400-600ms
- Micro: 200ms
- Easing: ease-out default, ease-in-out for layouts

## Layout System

### Grid
- Blog posts: 2-column (gap-8), collapses to 1-column mobile
- Features: 3-column (gap-12), collapses to 1-column mobile
- Responsive breakpoints: Mobile <768px, Tablet 768-1024px, Desktop >1024px

### Content Hierarchy
- Widest: Blog grid (72rem)
- Wide: Hero, About (64rem)  
- Medium: Header (80rem)
- Narrow: Article, Editor (48rem)

## Special Features

### Ornamental Elements
- Primary symbol: ❦ (fleuron in Georgia serif)
- Usage: Section dividers, attention markers, footer accents
- Opacity: 40% default, 60% on hover

### Drop Caps
- First letter: 4.5rem, float left
- Margin: 0.1em 0.15em 0 0
- Line-height: 0.85

### Pull Quotes  
- Extracted from middle paragraph
- 2xl-3xl italic, font-light
- 2px left border, pl-8
- Slides in from left

## Database & Admin

### Content Model
```
BlogPost {
  id, title, excerpt, content (paragraphs with \n\n),
  date, category, readTime, authorId, createdAt, updatedAt
}
```

### Admin Features
- Create/Edit/Delete posts
- Draft/Published status
- AI enhancement history (optional viewing)
- Simple authentication (single user: your mom)

## No Images
This is a text-only design celebrating the written word. No hero images, feature images, or photography. Visual interest comes from typography, spacing, and ornamental elements.