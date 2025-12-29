# Multi-Niche Affiliate Platform

A scalable, multi-site affiliate marketing platform built with Next.js 16. Run multiple affiliate sites from a single codebase, each with its own domain, branding, and content.

## Features

- **Multi-Site Architecture** - One codebase, multiple domains (e.g., `thegaminghubguide.com`, `techflow.com`)
- **Multi-Niche Support** - Gaming, Tech, and extensible to any niche
- **Dynamic Theming** - Per-site colors, branding via CSS custom properties
- **SEO Optimized** - JSON-LD structured data, canonical URLs, sitemaps, Open Graph
- **Affiliate Ready** - Product cards, affiliate links with proper rel attributes, FTC disclosures
- **Content Types** - Products, Categories, Articles (Roundups, Reviews, Comparisons, Buying Guides)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | App Router, React Server Components |
| React | 19 | UI Components |
| TypeScript | 5 | Type Safety |
| Prisma | 7 | ORM with PostgreSQL adapter |
| PostgreSQL | - | Database (Docker/OrbStack locally) |
| Tailwind CSS | 4 | Styling with `@theme inline` |
| shadcn/ui | - | UI Component Library |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (Docker recommended via OrbStack)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd affiliate-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database connection string

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed sample data
npx prisma db seed

# Generate domain mappings
npm run generate:domains

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/affiliate_db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Development

### Commands

```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Production build (generates domain mappings first)
npm run lint             # Run ESLint
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database
npm run generate:domains # Update domain-mappings.json
```

### Switching Sites in Development

Use the `?site` query parameter:

```
http://localhost:3000                    # Default site (demo-gaming)
http://localhost:3000?site=demo-gaming   # Gaming site
http://localhost:3000?site=demo-tech     # Tech site
```

## Architecture

### Domain Routing

```
Request: thegaminghubguide.com/products
    ↓
proxy.ts (Middleware)
    ├─ Extract hostname
    ├─ Lookup in domain-mappings.json
    └─ Rewrite: /products → /demo-gaming/products
        ↓
app/[site]/products/page.tsx
    ├─ params.site = "demo-gaming"
    └─ getSiteBySlug() fetches site config
```

### Project Structure

```
├── app/
│   ├── [site]/                 # Dynamic site routes
│   │   ├── _components/        # Site-wide components
│   │   ├── products/           # Product pages
│   │   ├── categories/         # Category pages
│   │   └── [contentSlug]/      # Reviews/Articles (dynamic)
│   ├── sitemap.ts              # Dynamic sitemap
│   └── robots.ts               # Robots.txt
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── products/               # Product components
│   ├── categories/             # Category components
│   ├── affiliate/              # Affiliate links & disclosures
│   └── seo/                    # JSON-LD components
├── lib/
│   ├── api/                    # Data fetching functions
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── config/                 # Domain mappings
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
└── proxy.ts                    # Domain routing middleware
```

### Data Model

```
Niche (Gaming, Tech, etc.)
  └── Site (domain, theme, contentSlug)
        ├── Product (affiliate links, ratings, pros/cons)
        ├── Category (hierarchical)
        └── Article (ROUNDUP, REVIEW, COMPARISON, BUYING_GUIDE, HOW_TO)
```

## Key Concepts

### Multi-Site Isolation

All content is scoped by `siteId`. Every database query must filter by site:

```typescript
// Always filter by siteId
const products = await prisma.product.findMany({
  where: { siteId, status: 'PUBLISHED' }
})
```

### Dynamic Theming

Each site has its own theme applied via CSS custom properties:

```typescript
// app/[site]/layout.tsx
const themeStyles = {
  '--site-primary': theme.primaryColor,
  '--site-secondary': theme.secondaryColor,
  '--site-accent': theme.accentColor,
}
```

### Content Slug Customization

Sites can customize their content section URL:
- Gaming: `/reviews`
- Tech: `/articles`

Configured via `Site.contentSlug` field.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Configure custom domains per site

### Self-Hosted

1. Build: `npm run build`
2. Start: `npm run start`
3. Configure reverse proxy for domain routing

## Roadmap

### Completed
- [x] Multi-site domain routing
- [x] Product, Category, Article pages
- [x] Dynamic theming per site
- [x] SEO (meta tags, JSON-LD, sitemaps)
- [x] Customizable content slugs

### In Progress
- [ ] Static pages (about, contact, privacy, terms)
- [ ] Search functionality

### Planned
- [ ] Admin Dashboard
  - [ ] Product management
  - [ ] Category management
  - [ ] Article editor
  - [ ] Site settings
- [ ] Analytics integration
- [ ] Affiliate link click tracking
- [ ] Email newsletter integration

## Documentation

- **CLAUDE.md** - Quick reference for AI assistants
- **RULES.md** - Comprehensive coding conventions

## License

MIT
