/**
 * Article API Functions
 *
 * Server-side data fetching functions for articles/reviews.
 * Uses React cache() for request-level deduplication.
 */

import { cache } from 'react'
import prisma from '@/lib/prisma'
import type {
  ArticleType,
  ArticleWithProducts,
  ArticleCardData,
  ArticleQueryOptions,
  ArticleListResponse,
  ContentStatus,
} from '@/lib/types'
import {
  toArticleCardData,
  toArticleWithProducts,
} from './mappers'

/**
 * Get articles for a site with filtering and pagination.
 *
 * @param siteId - The site ID
 * @param options - Query options for filtering, sorting, and pagination
 * @returns Paginated article list response
 *
 * @example
 * const { articles, total } = await getArticles(siteId, {
 *   status: 'PUBLISHED',
 *   articleType: 'ROUNDUP',
 *   limit: 10,
 *   offset: 0,
 * })
 */
export const getArticles = cache(
  async (siteId: string, options: ArticleQueryOptions = {}): Promise<ArticleListResponse> => {
    const {
      articleCategoryId,
      categoryId, // DEPRECATED
      articleType,
      status = 'PUBLISHED',
      featured,
      limit = 10,
      offset = 0,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = options

    const where = {
      siteId,
      status: status as ContentStatus,
      ...(articleCategoryId && { articleCategoryId }),
      ...(categoryId && { categoryId }), // DEPRECATED
      ...(articleType && { articleType }),
      ...(featured !== undefined && { isFeatured: featured }),
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          articleType: true,
          featuredImage: true,
          author: true,
          publishedAt: true,
          isFeatured: true,
          articleCategory: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
            },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              categoryType: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    return {
      articles: articles.map(toArticleCardData),
      total,
      limit,
      offset,
      hasMore: offset + articles.length < total,
    }
  }
)

/**
 * Get a single article by slug with full details including products.
 *
 * @param siteId - The site ID
 * @param slug - The article's URL-safe slug
 * @returns The full article with category and products, or null if not found
 *
 * @example
 * const article = await getArticleBySlug(siteId, 'best-gaming-keyboards-2025')
 */
export const getArticleBySlug = cache(
  async (siteId: string, slug: string): Promise<ArticleWithProducts | null> => {
    const article = await prisma.article.findFirst({
      where: {
        siteId,
        slug,
        status: 'PUBLISHED',
      },
      include: {
        articleCategory: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryType: true,
          },
        },
        products: {
          orderBy: { position: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                featuredImage: true,
                priceFrom: true,
                priceCurrency: true,
                rating: true,
                productType: true,
                isFeatured: true,
                primaryAffiliateUrl: true,
              },
            },
          },
        },
      },
    })

    if (!article) return null

    return toArticleWithProducts(article)
  }
)

/**
 * Get featured articles for a site.
 *
 * @param siteId - The site ID
 * @param limit - Maximum number of articles to return (default: 3)
 * @returns Array of featured article card data
 *
 * @example
 * const featured = await getFeaturedArticles(siteId, 3)
 */
export const getFeaturedArticles = cache(
  async (siteId: string, limit: number = 3): Promise<ArticleCardData[]> => {
    const articles = await prisma.article.findMany({
      where: {
        siteId,
        status: 'PUBLISHED',
        isFeatured: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        articleType: true,
        featuredImage: true,
        author: true,
        publishedAt: true,
        isFeatured: true,
        articleCategory: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryType: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return articles.map(toArticleCardData)
  }
)

/**
 * Get recent articles for a site.
 *
 * @param siteId - The site ID
 * @param limit - Maximum number of articles to return (default: 5)
 * @returns Array of recent article card data
 *
 * @example
 * const recent = await getRecentArticles(siteId, 5)
 */
export const getRecentArticles = cache(
  async (siteId: string, limit: number = 5): Promise<ArticleCardData[]> => {
    const articles = await prisma.article.findMany({
      where: {
        siteId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        articleType: true,
        featuredImage: true,
        author: true,
        publishedAt: true,
        isFeatured: true,
        articleCategory: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryType: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return articles.map(toArticleCardData)
  }
)

/**
 * Get articles by category.
 *
 * @param siteId - The site ID
 * @param categoryId - The category ID
 * @param limit - Maximum number of articles to return (default: 10)
 * @param offset - Number of articles to skip (default: 0)
 * @returns Paginated article list response
 *
 * @example
 * const { articles } = await getArticlesByCategory(siteId, categoryId)
 */
export const getArticlesByCategory = cache(
  async (
    siteId: string,
    categoryId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ArticleListResponse> => {
    const where = {
      siteId,
      categoryId,
      status: 'PUBLISHED' as ContentStatus,
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          articleType: true,
          featuredImage: true,
          author: true,
          publishedAt: true,
          isFeatured: true,
          articleCategory: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
            },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              categoryType: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    return {
      articles: articles.map(toArticleCardData),
      total,
      limit,
      offset,
      hasMore: offset + articles.length < total,
    }
  }
)

/**
 * Get related articles (same category or article type, excluding current).
 *
 * @param siteId - The site ID
 * @param articleId - Current article ID to exclude
 * @param categoryId - Optional category ID to match
 * @param articleType - Optional article type to match
 * @param limit - Maximum number of articles to return (default: 4)
 * @returns Array of related article card data
 *
 * @example
 * const related = await getRelatedArticles(siteId, currentId, categoryId, 'ROUNDUP', 4)
 */
export const getRelatedArticles = cache(
  async (
    siteId: string,
    articleId: string,
    articleCategoryId?: string | null,
    articleType?: ArticleType,
    limit: number = 4
  ): Promise<ArticleCardData[]> => {
    const articles = await prisma.article.findMany({
      where: {
        siteId,
        status: 'PUBLISHED',
        id: { not: articleId },
        OR: [
          ...(articleCategoryId ? [{ articleCategoryId }] : []),
          ...(articleType ? [{ articleType }] : []),
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        articleType: true,
        featuredImage: true,
        author: true,
        publishedAt: true,
        isFeatured: true,
        articleCategory: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryType: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return articles.map(toArticleCardData)
  }
)

/**
 * Get articles by type (roundups, reviews, buying guides, etc.).
 *
 * @param siteId - The site ID
 * @param articleType - The type of articles to fetch
 * @param limit - Maximum number of articles to return (default: 10)
 * @param offset - Number of articles to skip (default: 0)
 * @returns Paginated article list response
 *
 * @example
 * const { articles } = await getArticlesByType(siteId, 'ROUNDUP')
 */
export const getArticlesByType = cache(
  async (
    siteId: string,
    articleType: ArticleType,
    limit: number = 10,
    offset: number = 0
  ): Promise<ArticleListResponse> => {
    const where = {
      siteId,
      articleType,
      status: 'PUBLISHED' as ContentStatus,
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          articleType: true,
          featuredImage: true,
          author: true,
          publishedAt: true,
          isFeatured: true,
          articleCategory: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
            },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              categoryType: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    return {
      articles: articles.map(toArticleCardData),
      total,
      limit,
      offset,
      hasMore: offset + articles.length < total,
    }
  }
)

/**
 * Increment article view count.
 *
 * @param articleId - The article ID
 * @returns Updated view count
 *
 * @example
 * await incrementArticleViews(articleId)
 */
export const incrementArticleViews = async (articleId: string): Promise<number> => {
  const article = await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  })

  return article.viewCount
}

/**
 * Check if a slug is an article category that contains articles.
 * Used for URL disambiguation in nested routes.
 *
 * @param siteId - The site ID
 * @param slug - The slug to check
 * @returns The article category with article count if found, null otherwise
 *
 * @example
 * const category = await getArticleCategoryBySlug(siteId, 'buying-guides')
 * if (category) {
 *   // It's a category page
 * }
 */
export const getArticleCategoryBySlug = cache(
  async (
    siteId: string,
    slug: string
  ): Promise<{
    id: string
    slug: string
    name: string
    description: string | null
    featuredImage: string | null
    parent: { id: string; slug: string; name: string } | null
    _count: { articles: number }
  } | null> => {
    // Find article category with this slug that has articles
    const category = await prisma.articleCategory.findFirst({
      where: {
        siteId,
        slug,
        isActive: true,
        articles: {
          some: {
            status: 'PUBLISHED',
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        featuredImage: true,
        parent: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    })

    return category
  }
)

/**
 * Get articles by article category slug (for category pages).
 *
 * @param siteId - The site ID
 * @param categorySlug - The article category slug
 * @param limit - Maximum number of articles to return (default: 12)
 * @param offset - Number of articles to skip (default: 0)
 * @returns Paginated article list response with category info
 *
 * @example
 * const { articles, category } = await getArticlesByCategorySlug(siteId, 'buying-guides')
 */
export const getArticlesByCategorySlug = cache(
  async (
    siteId: string,
    categorySlug: string,
    limit: number = 12,
    offset: number = 0
  ): Promise<ArticleListResponse & {
    category: {
      id: string
      slug: string
      name: string
      description: string | null
    } | null
  }> => {
    // First find the article category
    const category = await prisma.articleCategory.findFirst({
      where: {
        siteId,
        slug: categorySlug,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
      },
    })

    if (!category) {
      return {
        articles: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
        category: null,
      }
    }

    const where = {
      siteId,
      articleCategoryId: category.id,
      status: 'PUBLISHED' as ContentStatus,
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          articleType: true,
          featuredImage: true,
          author: true,
          publishedAt: true,
          isFeatured: true,
          articleCategory: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
            },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              categoryType: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    return {
      articles: articles.map(toArticleCardData),
      total,
      limit,
      offset,
      hasMore: offset + articles.length < total,
      category,
    }
  }
)

/**
 * Article data with context from ArticleProduct join table.
 */
export interface ArticleWithProductContext {
  id: string
  slug: string
  title: string
  excerpt: string | null
  articleType: ArticleType
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
  /** Product context from join table */
  highlight: string | null
  position: number
}

/**
 * Get articles that feature a specific product.
 * Used on product detail pages for internal linking.
 *
 * @param siteId - The site ID
 * @param productId - The product ID to find articles for
 * @param limit - Maximum number of articles to return (default: 4)
 * @returns Array of articles with highlight/position context
 *
 * @example
 * const articles = await getArticlesByProductId(siteId, productId)
 */
export const getArticlesByProductId = cache(
  async (
    siteId: string,
    productId: string,
    limit: number = 4
  ): Promise<ArticleWithProductContext[]> => {
    const articleProducts = await prisma.articleProduct.findMany({
      where: {
        productId,
        article: {
          siteId,
          status: 'PUBLISHED',
        },
      },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            articleType: true,
            featuredImage: true,
            author: true,
            publishedAt: true,
            isFeatured: true,
            articleCategory: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: [
        { article: { isFeatured: 'desc' } },
        { article: { publishedAt: 'desc' } },
      ],
      take: limit,
    })

    return articleProducts.map((ap) => ({
      ...ap.article,
      highlight: ap.highlight,
      position: ap.position,
    }))
  }
)

/**
 * Get all article categories that have articles for a site.
 * Used for filter chips/tabs on article listing pages.
 *
 * @param siteId - The site ID
 * @returns Array of article categories with article counts
 *
 * @example
 * const categories = await getArticleCategories(siteId)
 */
export const getArticleCategories = cache(
  async (
    siteId: string
  ): Promise<
    Array<{
      id: string
      slug: string
      name: string
      description: string | null
      _count: { articles: number }
    }>
  > => {
    const categories = await prisma.articleCategory.findMany({
      where: {
        siteId,
        isActive: true,
        articles: {
          some: {
            status: 'PUBLISHED',
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return categories
  }
)
