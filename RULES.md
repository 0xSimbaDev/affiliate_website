# Multi-Niche Affiliate Platform - Coding Conventions

This document defines the comprehensive coding conventions and architectural patterns for the Multi-Niche Affiliate Platform built with Next.js 16, TypeScript, React 19, Prisma 7, and PostgreSQL.

## Table of Contents

- [Component Colocation Strategy](#component-colocation-strategy)
- [Component Guidelines](#component-guidelines)
- [API Functions](#api-functions)
- [State Management](#state-management)
- [File Naming Conventions](#file-naming-conventions)
- [TypeScript Conventions](#typescript-conventions)
- [Multi-Site Conventions](#multi-site-conventions)
- [Affiliate Marketing Conventions](#affiliate-marketing-conventions)
- [SEO Conventions](#seo-conventions)

---

## Component Colocation Strategy

### Principle: Keep Related Code Close

Components should be colocated with the routes that use them whenever possible. This improves maintainability and reduces cognitive load when working with specific features.

### Component Hierarchy

```
app/
   [site]/                           # Multi-site routes
      _components/                   # Site-wide shared components
         Header.tsx
         Footer.tsx
         Hero.tsx
         SectionHeader.tsx
      products/
         _components/                # Product-specific components
            ProductFilters.tsx
         [slug]/
            ImageGallery.tsx         # Product detail only
      categories/
         _components/
            CategoryFilter.tsx
      [contentSlug]/                 # Reviews/Articles/Guides
         _components/
            ArticleFilters.tsx

components/
   ui/                               # shadcn/ui components (primitives)
      button.tsx
      card.tsx
      badge.tsx
      skeleton.tsx
   products/                         # Shared product components
      ProductCard.tsx
      ProductGrid.tsx
      ProductFilters.tsx
   categories/                       # Shared category components
      CategoryCard.tsx
      CategoryGrid.tsx
   affiliate/                        # Affiliate-specific widgets
      AffiliateLink.tsx
      AffiliateDisclosure.tsx
   seo/                              # Structured data components
      JsonLd.tsx
      ProductJsonLd.tsx
      ArticleJsonLd.tsx
      WebsiteJsonLd.tsx
      BreadcrumbJsonLd.tsx
      CategoryJsonLd.tsx
      FAQJsonLd.tsx
```

### When to Use Each Location

**Route-Specific (`_components/` folder):**
- Components used ONLY in that route or its children
- Highly specialized to that feature's domain
- Example: `ImageGallery.tsx` in `products/[slug]/`

**App-Level Shared (`app/[site]/_components/`):**
- Components used across multiple pages within a site
- Navigation, headers, footers
- Example: `Header.tsx`, `Footer.tsx`

**Shared Business Components (`components/products/`, `components/categories/`):**
- Reusable business logic components used across the app
- Domain-specific but not tied to a single route
- Example: `ProductCard.tsx`, `CategoryCard.tsx`

**Affiliate Components (`components/affiliate/`):**
- All affiliate link handling
- FTC disclosure components
- Example: `AffiliateLink.tsx`, `AffiliateDisclosure.tsx`

**SEO Components (`components/seo/`):**
- JSON-LD structured data components
- Example: `ProductJsonLd.tsx`, `ArticleJsonLd.tsx`

**UI Primitives (`components/ui/`):**
- shadcn/ui components
- Basic building blocks without business logic
- Example: `button.tsx`, `card.tsx`, `badge.tsx`

---

## Component Guidelines

### Naming Conventions

**Component Files:**
- Use PascalCase for component files: `ProductCard.tsx`
- Match filename to the default export: `export default function ProductCard()`
- One component per file (exception: tightly coupled sub-components)

**Component Function Names:**
```typescript
// Good
export default function ProductCard() { }
export function AffiliateLink() { }

// Avoid
export default function productCard() { }
export const affiliateLink = () => { }
```

### Component Structure

Follow this standard structure for all components:

```typescript
// 1. Imports - organized by category
import { type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

// UI component imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Shared component imports
import { AffiliateLink } from "@/components/affiliate/AffiliateLink"

// Local imports
import { formatPrice } from "@/lib/utils"

// Type imports
import type { ProductCardData } from "@/lib/types"

// 2. Type definitions
interface ProductCardProps {
  product: ProductCardData
  variant?: "default" | "compact" | "featured"
  className?: string
  children?: ReactNode
}

// 3. Component definition
export default function ProductCard({
  product,
  variant = "default",
  className,
  children,
}: ProductCardProps) {
  // 4. Derived state and computations
  const formattedPrice = formatPrice(product.priceFrom)

  // 5. Event handlers (if client component)
  // const handleClick = () => { }

  // 6. Render
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component JSX */}
      </CardContent>
    </Card>
  )
}
```

### Server vs Client Components

**Default to Server Components:**
```typescript
// app/[site]/products/[slug]/page.tsx
// Server Component (default in App Router)
export default async function ProductPage({
  params
}: {
  params: Promise<{ site: string; slug: string }>
}) {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)
  const product = await getProductBySlug(siteData.id, slug)

  return (
    <article>
      <h1>{product.title}</h1>
      {/* Client components can be children */}
      <ImageGallery images={product.galleryImages} />
    </article>
  )
}
```

**Use Client Components When:**
- Using React hooks (useState, useEffect, etc.)
- Using event handlers (onClick, onChange, etc.)
- Using browser-only APIs (window, localStorage, etc.)
- Using context providers/consumers
- Interactive UI elements (galleries, filters, mobile menus)

```typescript
// app/[site]/products/[slug]/ImageGallery.tsx
"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div>
      <Image
        src={images[selectedIndex]}
        alt={alt}
        width={600}
        height={400}
      />
      <div className="flex gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={selectedIndex === index ? "ring-2" : ""}
          >
            <Image src={image} alt="" width={80} height={80} />
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Props Patterns

**Always define explicit interfaces:**
```typescript
// Good
interface ProductCardProps {
  product: ProductCardData
  showExcerpt?: boolean
  onSelect?: (productId: string) => void
  children?: ReactNode
}

export function ProductCard({
  product,
  showExcerpt = true,
  onSelect,
  children
}: ProductCardProps) { }

// Avoid
export function ProductCard(props: any) { }
```

**Use optional chaining for optional callbacks:**
```typescript
interface ComponentProps {
  onSuccess?: () => void
}

export function Component({ onSuccess }: ComponentProps) {
  const handleAction = () => {
    // Safe even if onSuccess is undefined
    onSuccess?.()
  }
}
```

---

## API Functions

### Location and Structure

All data fetching functions live in `lib/api/`:

```
lib/api/
   index.ts          # Barrel exports
   sites.ts          # Site resolution functions
   products.ts       # Product CRUD and queries
   categories.ts     # Category hierarchy and queries
   articles.ts       # Article/Review queries
```

### React cache() Pattern

**CRITICAL: Always wrap data fetching functions with React `cache()`:**

```typescript
// lib/api/products.ts
import { cache } from 'react'
import prisma from '@/lib/prisma'
import type { Product, ProductCardData } from '@/lib/types'

/**
 * Get products for a site with filtering and pagination.
 * Uses React cache() for request-level deduplication.
 */
export const getProducts = cache(async (
  siteId: string,
  options?: ProductQueryOptions
): Promise<ProductListResponse> => {
  const { categoryId, productType, status, limit = 20, offset = 0 } = options || {}

  const products = await prisma.product.findMany({
    where: {
      siteId,  // CRITICAL: Always filter by siteId
      ...(categoryId && { categories: { some: { categoryId } } }),
      ...(productType && { productType }),
      ...(status && { status }),
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
    take: limit,
    skip: offset,
  })

  return { products: products.map(toProductCardData), total: products.length }
})
```

### Return Type Patterns

**Full Data vs Card Data:**
```typescript
// Full product for detail pages
export const getProductBySlug = cache(async (
  siteId: string,
  slug: string
): Promise<ProductWithCategories | null> => {
  // Returns complete product with all relations
})

// Card data for listings (smaller payload)
export const getProducts = cache(async (
  siteId: string,
  options?: ProductQueryOptions
): Promise<{ products: ProductCardData[]; total: number }> => {
  // Returns minimal data needed for cards
})
```

### Site Scoping Rule

**CRITICAL: Every query must filter by siteId:**

```typescript
// Good - includes site isolation
async function getProducts(siteId: string) {
  return await prisma.product.findMany({
    where: {
      siteId,  // CRITICAL: Always filter by site
      status: 'PUBLISHED',
      isActive: true,
    },
  })
}

// Bad - missing site isolation (would return all sites' data)
async function getProducts() {
  return await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
    },
  })
}
```

---

## State Management

### Local Component State

Use `useState` for simple, component-local state:

```typescript
"use client"

import { useState } from "react"

export function ProductFilters() {
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  return (
    // Filter UI
  )
}
```

### Form State

Use `react-hook-form` with Zod validation for all forms:

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const productFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  excerpt: z.string().max(300, "Excerpt too long").optional(),
  priceFrom: z.number().min(0, "Price must be positive").optional(),
  seoTitle: z.string().max(60, "SEO title should be under 60 characters").optional(),
  seoDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export function ProductForm() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
    },
  })

  const onSubmit = (data: ProductFormValues) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Product</Button>
      </form>
    </Form>
  )
}
```

### Server State (Data Fetching)

For server-side data fetching in Server Components:

```typescript
// app/[site]/products/[slug]/page.tsx
import { notFound } from "next/navigation"
import { getSiteBySlug } from "@/lib/api/sites"
import { getProductBySlug } from "@/lib/api/products"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ site: string; slug: string }>
}) {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)

  if (!siteData) notFound()

  const product = await getProductBySlug(siteData.id, slug)

  if (!product) notFound()

  return (
    <article>
      <h1>{product.title}</h1>
    </article>
  )
}
```

---

## File Naming Conventions

### Pages and Routes

- Use lowercase with hyphens for route segments
- Pages are always `page.tsx`
- Layouts are always `layout.tsx`
- Dynamic routes use brackets: `[slug]`, `[site]`

```
app/
   [site]/
      page.tsx               # /{site}
      layout.tsx
      products/
          page.tsx           # /{site}/products
          [slug]/
              page.tsx       # /{site}/products/{slug}
      categories/
          page.tsx           # /{site}/categories
          [slug]/
              page.tsx       # /{site}/categories/{slug}
      [contentSlug]/         # /{site}/reviews or /{site}/articles
          page.tsx
          [slug]/
              page.tsx
```

### Components

- PascalCase for component files: `ProductCard.tsx`
- PascalCase for component directories if containing related files
- Prefix with underscore for route-specific: `_components/`

### Utilities and Helpers

- camelCase for utility files: `formatPrice.ts`, `seo.ts`
- Group related utilities in directories: `lib/utils/`

### Types

- PascalCase for type files matching the domain: `product.ts`, `article.ts`
- Use singular names: `product.ts` not `products.ts`
- Group in `lib/types/` directory

### Constants

- SCREAMING_SNAKE_CASE for constant values
- camelCase for filename: `constants.ts`

---

## TypeScript Conventions

### Type Definitions

**Always use explicit types:**
```typescript
// Good
interface Product {
  id: string
  title: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  publishedAt: Date | null
}

// Avoid
const product = {
  id: "123",
  title: "Gaming Mouse",
  status: "PUBLISHED",
}
```

**Use type vs interface appropriately:**
```typescript
// Use interface for object shapes (can be extended)
interface Product {
  id: string
  title: string
}

// Use type for unions, intersections, primitives
type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
type ProductWithCategories = Product & { categories: Category[] }
```

### Decimal Handling

Prisma returns Decimal as objects. Convert for display:

```typescript
// lib/types/product.ts
export interface ProductCardData {
  id: string
  title: string
  priceFrom: number | null  // Converted from Decimal
  rating: number | null     // Converted from Decimal
}

// Conversion helper
export function toProductCardData(product: Product): ProductCardData {
  return {
    ...product,
    priceFrom: product.priceFrom ? Number(product.priceFrom) : null,
    rating: product.rating ? Number(product.rating) : null,
  }
}
```

### Type Organization

```
lib/types/
   index.ts        # Barrel exports
   niche.ts        # Niche configuration types
   site.ts         # Site and theme types
   product.ts      # Product types (full, card, input)
   category.ts     # Category hierarchy types
   article.ts      # Article/review types
```

---

## Multi-Site Conventions

### Domain Routing

The middleware resolves sites from domains:

```typescript
// proxy.ts
const DOMAIN_MAP: Record<string, string> = {
  'thegaminghubguide.com': 'demo-gaming',
  'techflow.com': 'demo-tech',
  'localhost': 'demo-gaming',
}
```

### Always Filter by Site ID

**CRITICAL: Every database query for content must include siteId filtering:**

```typescript
// Good - includes site isolation
async function getProducts(siteId: string) {
  return await prisma.product.findMany({
    where: {
      siteId,  // CRITICAL: Always filter by site
      status: 'PUBLISHED',
    },
  })
}

// Bad - missing site isolation
async function getProducts() {
  return await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
  })
}
```

### Site-Scoped Navigation

**CRITICAL: All navigation links must include the site slug:**

```typescript
// Good - site-scoped links
const navLinks = [
  { href: `/${siteSlug}/products`, label: 'Products' },
  { href: `/${siteSlug}/categories`, label: 'Categories' },
  { href: `/${siteSlug}/${contentSlug}`, label: contentLabel },
]

// Bad - absolute paths (breaks multi-site)
const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
]
```

### Dynamic Theming

Theme is applied via CSS custom properties in the site layout:

```typescript
// app/[site]/layout.tsx
const themeStyles: React.CSSProperties = {
  '--site-primary': theme?.primaryColor || '#0066cc',
  '--site-secondary': theme?.secondaryColor || '#4a5568',
  '--site-accent': theme?.accentColor || '#38a169',
  '--site-background': theme?.backgroundColor || '#ffffff',
  '--site-text': theme?.textColor || '#1a202c',
}

return (
  <div style={themeStyles}>
    {children}
  </div>
)
```

**Usage in Components:**
```css
.btn-primary {
  background-color: var(--site-primary);
}
```

### Content Slug Customization

Each site can customize its content section URL:

```typescript
// Site model
contentSlug: 'reviews' | 'articles' | 'guides' | 'blog'

// Usage in navigation
const contentPath = `/${siteSlug}/${site.contentSlug}`
```

---

## Affiliate Marketing Conventions

### Affiliate Link Requirements

**Always use the AffiliateLink component for tracked links:**

```typescript
// Good - proper affiliate link
import { AffiliateLink } from "@/components/affiliate/AffiliateLink"

<AffiliateLink
  href={product.primaryAffiliateUrl}
  partner="amazon"
>
  Buy Now
</AffiliateLink>

// Bad - untracked link
<a href={product.primaryAffiliateUrl} target="_blank">
  Buy Now
</a>
```

### Link rel Attributes

**AffiliateLink component automatically includes proper rel attributes:**

```typescript
// components/affiliate/AffiliateLink.tsx
rel="nofollow sponsored noopener noreferrer"
target="_blank"
```

### Affiliate Disclosure

**Required on all pages with affiliate content:**

```typescript
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure"

// In product/article pages
<AffiliateDisclosure />
```

### Product Card Pattern

```typescript
interface ProductCardProps {
  product: ProductCardData
  variant?: "default" | "compact" | "featured"
  showAffiliateBadge?: boolean
}

export function ProductCard({
  product,
  variant = "default",
  showAffiliateBadge = true,
}: ProductCardProps) {
  return (
    <Card>
      <CardContent>
        {/* Product details */}
        {product.primaryAffiliateUrl && (
          <AffiliateLink
            href={product.primaryAffiliateUrl}
            partner="amazon"
          >
            View Deal
          </AffiliateLink>
        )}
        {showAffiliateBadge && <AffiliateDisclosure compact />}
      </CardContent>
    </Card>
  )
}
```

---

## SEO Conventions

### Metadata Pattern

**All pages must implement generateMetadata:**

```typescript
// app/[site]/products/[slug]/page.tsx
import { Metadata } from "next"
import { getSiteBySlug } from "@/lib/api/sites"
import { getProductBySlug } from "@/lib/api/products"
import { buildCanonicalUrl } from "@/lib/utils/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string; slug: string }>
}): Promise<Metadata> {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)
  const product = await getProductBySlug(siteData!.id, slug)

  if (!product) return {}

  const canonicalUrl = buildCanonicalUrl(siteData!, `/products/${slug}`)

  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.title,
      description: product.excerpt || undefined,
      type: 'website',
      url: canonicalUrl,
      siteName: siteData!.name,
      images: product.featuredImage ? [{ url: product.featuredImage }] : undefined,
    },
  }
}
```

### JSON-LD Structured Data

**Use dedicated components for each schema type:**

```typescript
// Product page
import { ProductJsonLd } from "@/components/seo/ProductJsonLd"
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd"

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(siteId, slug)

  return (
    <>
      <ProductJsonLd product={product} site={site} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Products', url: `${baseUrl}/products` },
          { name: product.title, url: `${baseUrl}/products/${slug}` },
        ]}
      />
      {/* Page content */}
    </>
  )
}
```

### Canonical URLs

**Always use the site's configured domain:**

```typescript
// lib/utils/seo.ts
export function buildCanonicalUrl(site: SiteWithNiche, path: string): string {
  const baseUrl = `https://${site.domain}`
  return `${baseUrl}${path}`
}
```

---

## Summary Checklist

When creating new features, ensure:

- [ ] Components are colocated in appropriate `_components/` folders
- [ ] Server Components are used by default, Client Components only when needed
- [ ] All props have explicit TypeScript interfaces
- [ ] Forms use react-hook-form with Zod validation
- [ ] All database queries include `siteId` filtering (multi-site isolation)
- [ ] All navigation links are site-scoped (`/${siteSlug}/path`)
- [ ] Affiliate links use the `AffiliateLink` component
- [ ] Affiliate disclosure is included on pages with affiliate content
- [ ] SEO metadata is properly configured via generateMetadata
- [ ] JSON-LD structured data is added for products, articles, categories
- [ ] Canonical URLs use the site's configured domain
- [ ] File naming follows conventions (PascalCase for components, lowercase for routes)
- [ ] Types are defined in `lib/types/` and reused across the app
- [ ] API functions use React `cache()` for request deduplication

---

**Last Updated:** 2025-12-28
**Version:** 1.0.0
