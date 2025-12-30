/**
 * Type-Safe Mapper Functions
 *
 * These functions provide type-safe transformations from Prisma query results
 * to application-level types. They replace unsafe `as unknown as` casts with
 * explicit field mapping for better type safety and maintainability.
 */

import type {
  SiteWithNiche,
  SiteTheme,
  SiteSocial,
  ContentSlugType,
  NicheConfig,
  ProductTypeDefinition,
  CategoryTypeDefinition,
  AffiliatePartner,
  ProductWithCategories,
  ProductCardData,
  ProductCategoryRelation,
  AffiliateLink,
  ArticleWithProducts,
  ArticleCardData,
  ArticleType,
  ArticleProductReference,
} from '@/lib/types'

// ============================================================================
// Prisma Result Types
// These represent the raw shapes returned by Prisma queries
// ============================================================================

/**
 * Raw Prisma Site with Niche include result
 */
interface PrismaSiteWithNiche {
  id: string
  nicheId: string
  slug: string
  name: string
  domain: string
  tagline: string | null
  description: string | null
  theme: unknown // JSON field
  social: unknown // JSON field
  gtmId: string | null
  cdnBaseUrl: string | null
  contentSlug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  niche: {
    id: string
    slug: string
    name: string
    description: string | null
    productTypes: unknown // JSON field
    categoryTypes: unknown // JSON field
    partners: unknown // JSON field
    layoutConfig?: unknown // JSON field
    createdAt: Date
    updatedAt: Date
  }
}

/**
 * Raw Prisma Product with categories include result
 */
interface PrismaProductWithCategories {
  id: string
  siteId: string
  productType: string
  slug: string
  title: string
  excerpt: string | null
  description: string | null
  content: string | null
  featuredImage: string | null
  galleryImages: string[]
  priceFrom: { toNumber(): number } | null
  priceTo: { toNumber(): number } | null
  priceCurrency: string | null
  priceText: string | null
  rating: { toNumber(): number } | null
  reviewCount: number | null
  affiliateLinks: unknown // JSON field
  primaryAffiliateUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string[]
  metadata: unknown // JSON field
  status: string
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  categories: Array<{
    id: string
    productId: string
    categoryId: string
    isPrimary: boolean
    createdAt: Date
    category: {
      id: string
      slug: string
      name: string
      categoryType: string
    }
  }>
}

/**
 * Raw Prisma Product for card data (select result)
 */
interface PrismaProductForCard {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  priceFrom: { toNumber(): number } | null
  priceCurrency: string | null
  rating: { toNumber(): number } | null
  productType: string
  isFeatured: boolean
}

/**
 * Raw Prisma Article with products include result
 */
interface PrismaArticleWithProducts {
  id: string
  siteId: string
  articleCategoryId: string | null
  categoryId: string | null
  articleType: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  featuredImage: string | null
  faqs: unknown // JSON field
  author: string | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string[]
  status: string
  isFeatured: boolean
  publishedAt: Date | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  articleCategory: {
    id: string
    slug: string
    name: string
    description: string | null
  } | null
  category: {
    id: string
    slug: string
    name: string
    categoryType: string
  } | null
  products: Array<{
    id: string
    productId: string
    position: number
    highlight: string | null
    product: {
      id: string
      slug: string
      title: string
      excerpt: string | null
      featuredImage: string | null
      priceFrom: { toNumber(): number } | null
      priceCurrency: string | null
      rating: { toNumber(): number } | null
      productType: string
      isFeatured: boolean
      primaryAffiliateUrl: string | null
    }
  }>
}

/**
 * Raw Prisma Article for card data (select result)
 */
interface PrismaArticleForCard {
  id: string
  slug: string
  title: string
  excerpt: string | null
  articleType: string
  featuredImage: string | null
  author: string | null
  publishedAt: Date | null
  isFeatured: boolean
  articleCategory: {
    id: string
    slug: string
    name: string
    description: string | null
  } | null
  category: {
    id: string
    slug: string
    name: string
    categoryType: string
  } | null
  _count?: {
    products: number
  }
}

// ============================================================================
// Mapper Functions
// ============================================================================

/**
 * Maps a Prisma Site with Niche to SiteWithNiche type.
 *
 * @param site - The raw Prisma query result
 * @returns Type-safe SiteWithNiche object
 *
 * @example
 * const site = await prisma.site.findUnique({
 *   where: { slug },
 *   include: { niche: true }
 * })
 * if (site) {
 *   return toSiteWithNiche(site)
 * }
 */
export function toSiteWithNiche(site: PrismaSiteWithNiche): SiteWithNiche {
  return {
    id: site.id,
    nicheId: site.nicheId,
    slug: site.slug,
    name: site.name,
    domain: site.domain,
    tagline: site.tagline,
    description: site.description,
    theme: parseTheme(site.theme),
    social: parseSocial(site.social),
    gtmId: site.gtmId,
    cdnBaseUrl: site.cdnBaseUrl,
    contentSlug: parseContentSlug(site.contentSlug),
    isActive: site.isActive,
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
    niche: toNicheConfig(site.niche),
  }
}

/**
 * Maps a Prisma Niche to NicheConfig type.
 *
 * @param niche - The raw Prisma niche result
 * @returns Type-safe NicheConfig object
 */
export function toNicheConfig(niche: PrismaSiteWithNiche['niche']): NicheConfig {
  return {
    id: niche.id,
    slug: niche.slug,
    name: niche.name,
    description: niche.description,
    productTypes: parseProductTypes(niche.productTypes),
    categoryTypes: parseCategoryTypes(niche.categoryTypes),
    partners: parsePartners(niche.partners),
    layoutConfig: niche.layoutConfig as Record<string, unknown> | null | undefined,
    createdAt: niche.createdAt,
    updatedAt: niche.updatedAt,
  }
}

/**
 * Maps a Prisma Product with categories to ProductWithCategories type.
 *
 * @param product - The raw Prisma query result
 * @returns Type-safe ProductWithCategories object
 *
 * @example
 * const product = await prisma.product.findUnique({
 *   where: { siteId_slug: { siteId, slug } },
 *   include: { categories: { include: { category: true } } }
 * })
 * if (product) {
 *   return toProductWithCategories(product)
 * }
 */
export function toProductWithCategories(product: PrismaProductWithCategories): ProductWithCategories {
  return {
    id: product.id,
    siteId: product.siteId,
    productType: product.productType,
    slug: product.slug,
    title: product.title,
    excerpt: product.excerpt,
    description: product.description,
    content: product.content,
    featuredImage: product.featuredImage,
    galleryImages: product.galleryImages,
    priceFrom: product.priceFrom?.toNumber() ?? null,
    priceTo: product.priceTo?.toNumber() ?? null,
    priceCurrency: product.priceCurrency,
    priceText: product.priceText,
    rating: product.rating?.toNumber() ?? null,
    reviewCount: product.reviewCount,
    affiliateLinks: parseAffiliateLinks(product.affiliateLinks),
    primaryAffiliateUrl: product.primaryAffiliateUrl,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    metadata: product.metadata as Record<string, unknown> | null,
    status: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    publishedAt: product.publishedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    categories: product.categories.map(toProductCategoryRelation),
  }
}

/**
 * Maps a Prisma ProductCategory relation to ProductCategoryRelation type.
 *
 * @param relation - The raw Prisma relation result
 * @returns Type-safe ProductCategoryRelation object
 */
export function toProductCategoryRelation(
  relation: PrismaProductWithCategories['categories'][number]
): ProductCategoryRelation {
  return {
    id: relation.id,
    productId: relation.productId,
    categoryId: relation.categoryId,
    isPrimary: relation.isPrimary,
    createdAt: relation.createdAt,
    category: {
      id: relation.category.id,
      slug: relation.category.slug,
      name: relation.category.name,
      categoryType: relation.category.categoryType,
    },
  }
}

/**
 * Maps a Prisma Product select result to ProductCardData type.
 *
 * @param product - The raw Prisma select result
 * @returns Type-safe ProductCardData object
 *
 * @example
 * const products = await prisma.product.findMany({
 *   where: { siteId, status: 'PUBLISHED' },
 *   select: { id: true, slug: true, ... }
 * })
 * return products.map(toProductCardData)
 */
export function toProductCardData(product: PrismaProductForCard): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    excerpt: product.excerpt,
    featuredImage: product.featuredImage,
    priceFrom: product.priceFrom?.toNumber() ?? null,
    priceCurrency: product.priceCurrency,
    rating: product.rating?.toNumber() ?? null,
    productType: product.productType,
    isFeatured: product.isFeatured,
  }
}

/**
 * Maps a Prisma Article with products to ArticleWithProducts type.
 *
 * @param article - The raw Prisma query result
 * @returns Type-safe ArticleWithProducts object
 *
 * @example
 * const article = await prisma.article.findFirst({
 *   where: { siteId, slug },
 *   include: { articleCategory: true, category: true, products: { include: { product: true } } }
 * })
 * if (article) {
 *   return toArticleWithProducts(article)
 * }
 */
export function toArticleWithProducts(article: PrismaArticleWithProducts): ArticleWithProducts {
  return {
    id: article.id,
    siteId: article.siteId,
    articleCategoryId: article.articleCategoryId,
    categoryId: article.categoryId,
    articleType: article.articleType as ArticleType,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    featuredImage: article.featuredImage,
    faqs: parseFAQs(article.faqs),
    author: article.author,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    seoKeywords: article.seoKeywords,
    status: article.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    isFeatured: article.isFeatured,
    publishedAt: article.publishedAt,
    viewCount: article.viewCount,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    articleCategory: article.articleCategory,
    category: article.category,
    products: article.products.map(toArticleProductReference),
  }
}

/**
 * Maps a Prisma ArticleProduct relation to ArticleProductReference type.
 *
 * @param relation - The raw Prisma relation result
 * @returns Type-safe ArticleProductReference object
 */
export function toArticleProductReference(
  relation: PrismaArticleWithProducts['products'][number]
): ArticleProductReference {
  return {
    id: relation.id,
    productId: relation.productId,
    position: relation.position,
    highlight: relation.highlight,
    product: {
      id: relation.product.id,
      slug: relation.product.slug,
      title: relation.product.title,
      excerpt: relation.product.excerpt,
      featuredImage: relation.product.featuredImage,
      priceFrom: relation.product.priceFrom?.toNumber() ?? null,
      priceCurrency: relation.product.priceCurrency,
      rating: relation.product.rating?.toNumber() ?? null,
      productType: relation.product.productType,
      isFeatured: relation.product.isFeatured,
      primaryAffiliateUrl: relation.product.primaryAffiliateUrl,
    },
  }
}

/**
 * Maps a Prisma Article select result to ArticleCardData type.
 *
 * @param article - The raw Prisma select result
 * @returns Type-safe ArticleCardData object
 *
 * @example
 * const articles = await prisma.article.findMany({
 *   where: { siteId, status: 'PUBLISHED' },
 *   select: { id: true, slug: true, ... }
 * })
 * return articles.map(toArticleCardData)
 */
export function toArticleCardData(article: PrismaArticleForCard): ArticleCardData {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    articleType: article.articleType as ArticleType,
    featuredImage: article.featuredImage,
    author: article.author,
    publishedAt: article.publishedAt,
    isFeatured: article.isFeatured,
    articleCategory: article.articleCategory,
    category: article.category,
    productCount: article._count?.products,
  }
}

// ============================================================================
// JSON Field Parsers
// These helper functions safely parse JSON fields from Prisma
// ============================================================================

/**
 * Parses the theme JSON field to SiteTheme type.
 */
function parseTheme(theme: unknown): SiteTheme {
  if (!theme || typeof theme !== 'object') {
    return {
      primaryColor: '#1a56db',
      secondaryColor: '#6366f1',
      accentColor: '#f59e0b',
    }
  }

  const t = theme as Record<string, unknown>
  return {
    primaryColor: (t.primaryColor as string) || '#1a56db',
    secondaryColor: (t.secondaryColor as string) || '#6366f1',
    accentColor: (t.accentColor as string) || '#f59e0b',
    backgroundColor: t.backgroundColor as string | undefined,
    textColor: t.textColor as string | undefined,
    fontHeading: t.fontHeading as string | undefined,
    fontBody: t.fontBody as string | undefined,
  }
}

/**
 * Parses the social JSON field to SiteSocial type.
 */
function parseSocial(social: unknown): SiteSocial | null {
  if (!social || typeof social !== 'object') {
    return null
  }

  const s = social as Record<string, unknown>
  return {
    twitter: s.twitter as string | undefined,
    instagram: s.instagram as string | undefined,
    facebook: s.facebook as string | undefined,
    pinterest: s.pinterest as string | undefined,
    youtube: s.youtube as string | undefined,
    tiktok: s.tiktok as string | undefined,
    linkedin: s.linkedin as string | undefined,
  }
}

/**
 * Parses contentSlug string to ContentSlugType.
 */
function parseContentSlug(slug: string): ContentSlugType {
  const validSlugs: ContentSlugType[] = ['reviews', 'articles', 'guides', 'blog']
  return validSlugs.includes(slug as ContentSlugType)
    ? (slug as ContentSlugType)
    : 'reviews'
}

/**
 * Parses the productTypes JSON field to ProductTypeDefinition[].
 */
function parseProductTypes(productTypes: unknown): ProductTypeDefinition[] {
  if (!Array.isArray(productTypes)) {
    return []
  }

  return productTypes.map((pt) => {
    const p = pt as Record<string, unknown>
    return {
      slug: (p.slug as string) || '',
      label: (p.label as string) || '',
      labelPlural: (p.labelPlural as string) || '',
      icon: (p.icon as string) || '',
    }
  })
}

/**
 * Parses the categoryTypes JSON field to CategoryTypeDefinition[].
 */
function parseCategoryTypes(categoryTypes: unknown): CategoryTypeDefinition[] {
  if (!Array.isArray(categoryTypes)) {
    return []
  }

  return categoryTypes.map((ct) => {
    const c = ct as Record<string, unknown>
    return {
      slug: (c.slug as string) || '',
      label: (c.label as string) || '',
      hierarchical: Boolean(c.hierarchical),
      maxDepth: (c.maxDepth as number) || 1,
    }
  })
}

/**
 * Parses the partners JSON field to AffiliatePartner[].
 */
function parsePartners(partners: unknown): AffiliatePartner[] {
  if (!Array.isArray(partners)) {
    return []
  }

  return partners.map((p) => {
    const partner = p as Record<string, unknown>
    return {
      slug: (partner.slug as string) || '',
      name: (partner.name as string) || '',
      productTypes: Array.isArray(partner.productTypes)
        ? (partner.productTypes as string[])
        : [],
    }
  })
}

/**
 * Parses the affiliateLinks JSON field to AffiliateLink[].
 */
function parseAffiliateLinks(links: unknown): AffiliateLink[] | null {
  if (!links) {
    return null
  }

  // Handle string-encoded JSON
  const parsed = typeof links === 'string' ? JSON.parse(links) : links

  if (!Array.isArray(parsed)) {
    return null
  }

  return parsed.map((link) => {
    const l = link as Record<string, unknown>
    return {
      partner: (l.partner as string) || '',
      url: (l.url as string) || '',
      label: l.label as string | undefined,
      isPrimary: l.isPrimary as boolean | undefined,
    }
  })
}

/**
 * Parses the FAQs JSON field to ArticleFAQ[].
 */
function parseFAQs(faqs: unknown): Array<{ question: string; answer: string }> | null {
  if (!faqs) {
    return null
  }

  // Handle string-encoded JSON
  const parsed = typeof faqs === 'string' ? JSON.parse(faqs) : faqs

  if (!Array.isArray(parsed)) {
    return null
  }

  return parsed.map((faq) => {
    const f = faq as Record<string, unknown>
    return {
      question: (f.question as string) || '',
      answer: (f.answer as string) || '',
    }
  })
}
