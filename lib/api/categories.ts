/**
 * Category API Functions
 *
 * Server-side data fetching functions for categories.
 * Uses React cache() for request-level deduplication.
 */

import { cache } from 'react'
import prisma from '@/lib/prisma'
import type {
  Category,
  CategoryWithChildren,
  CategoryWithParent,
  CategoryWithHierarchy,
  CategoryReference,
  CategoryQueryOptions,
} from '@/lib/types'

/**
 * Get categories for a site with filtering options.
 *
 * @param siteId - The site ID
 * @param options - Query options for filtering and sorting
 * @returns Array of categories
 *
 * @example
 * const destinations = await getCategories(siteId, {
 *   categoryType: 'destination',
 *   parentId: null, // root categories only
 * })
 */
export const getCategories = cache(
  async (siteId: string, options: CategoryQueryOptions = {}): Promise<Category[]> => {
    const {
      categoryType,
      parentId,
      isActive = true,
      includeChildren = false,
      includeParent = false,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = options

    const where = {
      siteId,
      isActive,
      ...(categoryType && { categoryType }),
      ...(parentId !== undefined && { parentId }),
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        ...(includeChildren && {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' as const },
          },
        }),
        ...(includeParent && { parent: true }),
      },
      orderBy: { [sortBy]: sortOrder },
    })

    return categories as unknown as Category[]
  }
)

/**
 * Get a single category by its slug and type.
 *
 * @param siteId - The site ID
 * @param categoryType - The category type slug
 * @param slug - The category's URL-safe slug
 * @returns The category with parent, or null if not found
 *
 * @example
 * const category = await getCategoryBySlug(siteId, 'destination', 'europe')
 */
export const getCategoryBySlug = cache(
  async (
    siteId: string,
    categoryType: string,
    slug: string
  ): Promise<CategoryWithParent | null> => {
    const category = await prisma.category.findUnique({
      where: {
        siteId_categoryType_slug: { siteId, categoryType, slug },
      },
      include: {
        parent: true,
      },
    })

    if (!category) return null

    return category as unknown as CategoryWithParent
  }
)

/**
 * Get root categories (no parent) for a category type.
 *
 * @param siteId - The site ID
 * @param categoryType - The category type slug
 * @returns Array of root categories with their children
 *
 * @example
 * const continents = await getRootCategories(siteId, 'destination')
 */
export const getRootCategories = cache(
  async (siteId: string, categoryType: string): Promise<CategoryWithChildren[]> => {
    const categories = await prisma.category.findMany({
      where: {
        siteId,
        categoryType,
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return categories as unknown as CategoryWithChildren[]
  }
)

/**
 * Get a category with its full hierarchy (parent and children).
 *
 * @param siteId - The site ID
 * @param categoryType - The category type slug
 * @param slug - The category's URL-safe slug
 * @returns The category with full hierarchy, or null if not found
 *
 * @example
 * const category = await getCategoryWithChildren(siteId, 'destination', 'france')
 */
export const getCategoryWithChildren = cache(
  async (
    siteId: string,
    categoryType: string,
    slug: string
  ): Promise<CategoryWithHierarchy | null> => {
    const category = await prisma.category.findUnique({
      where: {
        siteId_categoryType_slug: { siteId, categoryType, slug },
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    })

    if (!category) return null

    return category as unknown as CategoryWithHierarchy
  }
)

/**
 * Get category references for navigation.
 * Returns minimal data for building nav menus.
 *
 * @param siteId - The site ID
 * @param categoryType - The category type slug
 * @returns Array of category references
 *
 * @example
 * const navItems = await getCategoryReferences(siteId, 'destination')
 */
export const getCategoryReferences = cache(
  async (siteId: string, categoryType: string): Promise<CategoryReference[]> => {
    const categories = await prisma.category.findMany({
      where: {
        siteId,
        categoryType,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        categoryType: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return categories
  }
)

/**
 * Get the full breadcrumb path for a category.
 * Returns an array from root to the current category.
 *
 * @param siteId - The site ID
 * @param categoryId - The category ID
 * @returns Array of category references forming the breadcrumb path
 *
 * @example
 * const breadcrumbs = await getCategoryBreadcrumbs(siteId, categoryId)
 * // Returns: [{ name: 'Europe' }, { name: 'France' }, { name: 'Paris' }]
 */
export const getCategoryBreadcrumbs = cache(
  async (siteId: string, categoryId: string): Promise<CategoryReference[]> => {
    type CategoryBreadcrumbResult = {
      id: string
      slug: string
      name: string
      categoryType: string
      parentId: string | null
      siteId: string
    } | null

    const breadcrumbs: CategoryReference[] = []
    let currentId: string | null = categoryId

    while (currentId) {
      const category: CategoryBreadcrumbResult = await prisma.category.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          slug: true,
          name: true,
          categoryType: true,
          parentId: true,
          siteId: true,
        },
      })

      if (!category || category.siteId !== siteId) break

      breadcrumbs.unshift({
        id: category.id,
        slug: category.slug,
        name: category.name,
        categoryType: category.categoryType,
      })

      currentId = category.parentId
    }

    return breadcrumbs
  }
)

/**
 * Batch fetch categories by their slugs.
 * Efficient for resolving shortcode references in content.
 *
 * @param siteId - The site ID
 * @param slugs - Array of category slugs to fetch
 * @returns Map of slug to category reference
 *
 * @example
 * const categories = await getCategoriesBySlugs(siteId, ['gaming-mice', 'keyboards'])
 * const miceCategory = categories.get('gaming-mice')
 */
export const getCategoriesBySlugs = cache(
  async (siteId: string, slugs: string[]): Promise<Map<string, CategoryReference>> => {
    if (slugs.length === 0) {
      return new Map()
    }

    const categories = await prisma.category.findMany({
      where: {
        siteId,
        slug: { in: slugs },
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        categoryType: true,
      },
    })

    const categoryMap = new Map<string, CategoryReference>()
    for (const category of categories) {
      categoryMap.set(category.slug, category)
    }

    return categoryMap
  }
)

/**
 * Get all active categories for auto-linking.
 * Returns minimal data for building auto-link map.
 *
 * @param siteId - The site ID
 * @returns Array of category references for auto-linking
 *
 * @example
 * const allCategories = await getAllCategoriesForAutoLink(siteId)
 */
export const getAllCategoriesForAutoLink = cache(
  async (siteId: string): Promise<CategoryReference[]> => {
    const categories = await prisma.category.findMany({
      where: {
        siteId,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        categoryType: true,
      },
      orderBy: { name: 'asc' },
    })

    return categories
  }
)
