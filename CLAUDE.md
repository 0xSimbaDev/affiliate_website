# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-niche, multi-site affiliate platform built with Next.js 16 (App Router). Each site has its own domain (e.g., `thegaminghubguide.com` for Gaming, `techflow.com` for Tech) resolved via domain-based routing middleware.

## Commands

```bash
# Development
npm run dev                      # Start dev server (usually port 3000 or 3001)

# Database
npx prisma generate              # Regenerate Prisma client after schema changes
npx prisma db push               # Push schema changes to database
npx prisma db seed               # Seed database with sample data
npm run generate:domains         # Generate domain-mappings.json from database

# Build
npm run build                    # Runs generate:domains then next build
npm run lint                     # ESLint
```

## Architecture

### Multi-Site Domain Routing

```
Request: thegaminghubguide.com/products
    │
    ▼
proxy.ts (Middleware)
    │ - Extract hostname
    │ - Lookup in lib/config/domain-mappings.json
    │ - Rewrite: /products → /demo-gaming/products
    ▼
app/[site]/products/page.tsx
    │ - params.site = "demo-gaming"
    │ - getSiteBySlug() fetches site config
    ▼
Site renders with dynamic theming (CSS custom properties)
```

Development site switching: `http://localhost:3000?site=demo-tech`

### Key Files

- **proxy.ts** - Middleware for domain-to-slug rewriting
- **lib/config/domain-mappings.json** - Domain → site slug mapping (auto-generated)
- **lib/api/sites.ts** - Site resolution functions with React `cache()` for deduplication
- **lib/prisma.ts** - Prisma client with `@prisma/adapter-pg` for client-side engine
- **app/[site]/layout.tsx** - Per-site layout with dynamic CSS variables (`--site-primary`, etc.)

### Data Model

```
Niche (Gaming, Tech)
  └── Site (domain, theme, social, contentSlug)
        ├── Product (affiliate links, ratings, pros/cons)
        ├── Category (hierarchical)
        └── Article (ROUNDUP, REVIEW, COMPARISON, BUYING_GUIDE, HOW_TO)
```

All content is scoped by `siteId`. API functions in `lib/api/` always filter by siteId.

### Type System

- **lib/types/index.ts** - Barrel exports for all types
- **lib/types/site.ts** - Site, SiteWithNiche, ContentSlugType
- **lib/types/product.ts** - Product, ProductCardData, ProductWithCategories
- **lib/types/category.ts** - Category hierarchy types
- **lib/types/article.ts** - Article, ArticleType enum
- Prisma types available after `npx prisma generate`

## Tech Stack

- Next.js 16 with Turbopack
- Prisma 7 with `@prisma/adapter-pg` (requires PostgreSQL, uses Docker via OrbStack locally)
- Tailwind CSS v4 (`@theme inline` syntax in globals.css)
- shadcn/ui components in `components/ui/`
- React 19 Server Components (client components marked with `'use client'`)

## Component Patterns

### Server vs Client Components

**Default to Server Components.** Only use Client Components when:
- Using hooks (useState, useEffect)
- Using event handlers (onClick, onChange)
- Using browser APIs (window, localStorage)
- Interactive elements (galleries, filters, mobile menus)

```typescript
// Server Component (default)
export default async function ProductPage({ params }) {
  const product = await getProductBySlug(siteId, slug)
  return <ProductDetail product={product} />
}

// Client Component (when needed)
"use client"
export default function ImageGallery({ images }) {
  const [selected, setSelected] = useState(0)
  // ...
}
```

### Component Colocation

```
app/[site]/_components/     # Site-wide (Header, Footer)
components/products/        # Shared business components
components/affiliate/       # AffiliateLink, AffiliateDisclosure
components/seo/             # JSON-LD components
components/ui/              # shadcn/ui primitives
```

## Multi-Site Conventions

### CRITICAL: Always filter by siteId

```typescript
// Good
const products = await prisma.product.findMany({
  where: { siteId, status: 'PUBLISHED' }
})

// Bad - returns all sites' data
const products = await prisma.product.findMany({
  where: { status: 'PUBLISHED' }
})
```

### CRITICAL: Site-scoped navigation links

```typescript
// Good
const navLinks = [
  { href: `/${siteSlug}/products`, label: 'Products' },
]

// Bad - breaks multi-site
const navLinks = [
  { href: '/products', label: 'Products' },
]
```

### Dynamic Theming

Theme applied via CSS custom properties in `app/[site]/layout.tsx`:
- `--site-primary`, `--site-secondary`, `--site-accent`
- `--site-background`, `--site-text`

### Content Slug Customization

Each site can use different content section URLs:
- `demo-gaming` uses `/reviews`
- `demo-tech` uses `/articles`

Configured via `Site.contentSlug` field.

## Affiliate Marketing

### Always use AffiliateLink component

```typescript
import { AffiliateLink } from "@/components/affiliate/AffiliateLink"

<AffiliateLink href={product.primaryAffiliateUrl} partner="amazon">
  Buy Now
</AffiliateLink>
```

This automatically adds:
- `rel="nofollow sponsored noopener noreferrer"`
- `target="_blank"`

### Include AffiliateDisclosure on pages with affiliate content

```typescript
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure"

<AffiliateDisclosure />
```

## SEO Requirements

### All pages must implement generateMetadata

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)
  const product = await getProductBySlug(siteData.id, slug)

  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.excerpt,
    alternates: { canonical: buildCanonicalUrl(siteData, `/products/${slug}`) },
    openGraph: { ... }
  }
}
```

### Use JSON-LD components for structured data

- `ProductJsonLd` - Product pages
- `ArticleJsonLd` - Article/review pages
- `BreadcrumbJsonLd` - Navigation breadcrumbs
- `WebsiteJsonLd` - Homepage
- `CategoryJsonLd` - Category pages
- `FAQJsonLd` - FAQ sections

## Common Tasks

### Adding a new site

1. Create site record in database with niche reference
2. Run `npm run generate:domains` to update domain mappings
3. Add domain to `next.config.ts` images.remotePatterns if needed

### Adding a new product type

1. Add to niche's `productTypes` JSON field
2. Update seed data if needed
3. Product type is stored as string, no schema change needed

### Adding a new article type

1. Add to `ArticleType` enum in `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Update `lib/types/article.ts` if needed
4. Update `ArticleJsonLd` component for new schema type

### Adding a new niche

1. Create niche record with productTypes, categoryTypes, partners config
2. Create site(s) under the niche
3. Seed categories and products for the new site
4. Run `npm run generate:domains`

## API Function Patterns

All functions in `lib/api/` use React `cache()`:

```typescript
import { cache } from 'react'

export const getProducts = cache(async (siteId: string, options?: ProductQueryOptions) => {
  // Always filter by siteId
  return await prisma.product.findMany({
    where: { siteId, ...filters }
  })
})
```

**Return types:**
- Full data for detail pages: `getProductBySlug()` → `ProductWithCategories`
- Card data for listings: `getProducts()` → `ProductCardData[]`

## File Naming

- **Routes**: lowercase with hyphens (`products/`, `[slug]/`)
- **Components**: PascalCase (`ProductCard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Types**: PascalCase files, singular names (`product.ts`)

## See Also

- **RULES.md** - Comprehensive coding conventions
- **prisma/schema.prisma** - Database schema
- **lib/types/** - TypeScript type definitions
