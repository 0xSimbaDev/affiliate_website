/**
 * Article Category API Functions
 *
 * Server-side data fetching functions for article categories.
 * Article categories are separate from product categories and organize
 * content by type: Buying Guides, Reviews, How-To, Comparisons, etc.
 *
 * Uses React cache() for request-level deduplication.
 */

import { cache } from 'react'
import { prisma } from '@affiliate/database'
import type {
  ArticleCategoryWithChildren,
  ArticleCategoryWithParent,
  ArticleCategoryWithHierarchy,
  ArticleCategoryReference,
  ArticleCategoryQueryOptions,
} from '@affiliate/types'

/**
 * Get article categories for a site with filtering options.
 *
 * @param siteId - The site ID
 * @param options - Query options for filtering and sorting
 * @returns Array of article categories
 *
 * @example
 * const categories = await getArticleCategories(siteId, {
 *   parentId: null, // root categories only
 *   withArticles: true, // only categories with published articles
 * })
 */
export const getArticleCategories = cache(
  async (
    siteId: string,
    options: ArticleCategoryQueryOptions = {}
  ): Promise<ArticleCategoryReference[]> => {
    const {
      parentId,
      isActive = true,
      withArticles = false,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = options

    const where = {
      siteId,
      isActive,
      ...(parentId !== undefined && { parentId }),
      ...(withArticles && {
        articles: {
          some: {
            status: 'PUBLISHED' as const,
          },
        },
      }),
    }

    const categories = await prisma.articleCategory.findMany({
      where,
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
      orderBy: { [sortBy]: sortOrder },
    })

    return categories
  }
)

/**
 * Get a single article category by its slug.
 *
 * @param siteId - The site ID
 * @param slug - The category's URL-safe slug
 * @returns The article category with parent and article count, or null if not found
 *
 * @example
 * const category = await getArticleCategoryBySlug(siteId, 'buying-guides')
 */
export const getArticleCategoryBySlug = cache(
  async (
    siteId: string,
    slug: string
  ): Promise<ArticleCategoryWithParent | null> => {
    const category = await prisma.articleCategory.findUnique({
      where: {
        siteId_slug: { siteId, slug },
      },
      include: {
        parent: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
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

    if (!category) return null

    return category as unknown as ArticleCategoryWithParent
  }
)

/**
 * Get root article categories (no parent) for a site.
 *
 * @param siteId - The site ID
 * @returns Array of root article categories with their children
 *
 * @example
 * const rootCategories = await getRootArticleCategories(siteId)
 */
export const getRootArticleCategories = cache(
  async (siteId: string): Promise<ArticleCategoryWithChildren[]> => {
    const categories = await prisma.articleCategory.findMany({
      where: {
        siteId,
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
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

    return categories as unknown as ArticleCategoryWithChildren[]
  }
)

/**
 * Get an article category with its full hierarchy (parent and children).
 *
 * @param siteId - The site ID
 * @param slug - The category's URL-safe slug
 * @returns The article category with full hierarchy, or null if not found
 *
 * @example
 * const category = await getArticleCategoryWithChildren(siteId, 'buying-guides')
 */
export const getArticleCategoryWithChildren = cache(
  async (siteId: string, slug: string): Promise<ArticleCategoryWithHierarchy | null> => {
    const category = await prisma.articleCategory.findUnique({
      where: {
        siteId_slug: { siteId, slug },
      },
      include: {
        parent: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
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

    if (!category) return null

    return category as unknown as ArticleCategoryWithHierarchy
  }
)

/**
 * Get article category references for navigation.
 * Returns minimal data for building nav menus and filters.
 *
 * @param siteId - The site ID
 * @returns Array of article category references
 *
 * @example
 * const navItems = await getArticleCategoryReferences(siteId)
 */
export const getArticleCategoryReferences = cache(
  async (siteId: string): Promise<ArticleCategoryReference[]> => {
    const categories = await prisma.articleCategory.findMany({
      where: {
        siteId,
        isActive: true,
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

/**
 * Get the full breadcrumb path for an article category.
 * Returns an array from root to the current category.
 *
 * @param siteId - The site ID
 * @param categoryId - The article category ID
 * @returns Array of category references forming the breadcrumb path
 *
 * @example
 * const breadcrumbs = await getArticleCategoryBreadcrumbs(siteId, categoryId)
 */
export const getArticleCategoryBreadcrumbs = cache(
  async (siteId: string, categoryId: string): Promise<ArticleCategoryReference[]> => {
    type CategoryBreadcrumbResult = {
      id: string
      slug: string
      name: string
      description: string | null
      parentId: string | null
      siteId: string
    } | null

    const breadcrumbs: ArticleCategoryReference[] = []
    let currentId: string | null = categoryId

    while (currentId) {
      const category: CategoryBreadcrumbResult = await prisma.articleCategory.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          parentId: true,
          siteId: true,
        },
      })

      if (!category || category.siteId !== siteId) break

      breadcrumbs.unshift({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
      })

      currentId = category.parentId
    }

    return breadcrumbs
  }
)

/**
 * Check if a slug is an article category.
 * Used for route disambiguation.
 *
 * @param siteId - The site ID
 * @param slug - The slug to check
 * @returns The article category if found, null otherwise
 *
 * @example
 * const category = await isArticleCategorySlug(siteId, 'buying-guides')
 * if (category) {
 *   // It's a category page
 * }
 */
export const isArticleCategorySlug = cache(
  async (siteId: string, slug: string): Promise<ArticleCategoryReference | null> => {
    const category = await prisma.articleCategory.findUnique({
      where: {
        siteId_slug: { siteId, slug },
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
    })

    if (!category || !category._count.articles) return null

    return category
  }
)
