/**
 * Product API Functions
 *
 * Server-side data fetching functions for products.
 * Uses React cache() for request-level deduplication.
 */

import { cache } from 'react'
import { prisma } from '@affiliate/database'
import type {
  ProductWithCategories,
  ProductCardData,
  ProductQueryOptions,
  ProductListResponse,
  ContentStatus,
} from '@affiliate/types'
import {
  toProductCardData,
  toProductWithCategories,
} from './mappers'

/**
 * Get products for a site with filtering and pagination.
 *
 * @param siteId - The site ID
 * @param options - Query options for filtering, sorting, and pagination
 * @returns Paginated product list response
 *
 * @example
 * const { products, total } = await getProducts(siteId, {
 *   productType: 'hotel',
 *   status: 'PUBLISHED',
 *   limit: 12,
 *   offset: 0,
 * })
 */
export const getProducts = cache(
  async (siteId: string, options: ProductQueryOptions = {}): Promise<ProductListResponse> => {
    const {
      productType,
      featured,
      status = 'PUBLISHED',
      isActive = true,
      categoryId,
      limit = 12,
      offset = 0,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = options

    const where = {
      siteId,
      status: status as ContentStatus,
      isActive,
      ...(productType && { productType }),
      ...(featured !== undefined && { isFeatured: featured }),
      ...(categoryId && {
        categories: {
          some: { categoryId },
        },
      }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products: products.map(toProductCardData),
      total,
      limit,
      offset,
      hasMore: offset + products.length < total,
    }
  }
)

/**
 * Get a single product by slug.
 *
 * @param siteId - The site ID
 * @param slug - The product's URL-safe slug
 * @returns The full product with categories and affiliate links, or null if not found
 *
 * @example
 * const product = await getProductBySlug(siteId, 'luxury-hotel-paris')
 */
export const getProductBySlug = cache(
  async (siteId: string, slug: string): Promise<ProductWithCategories | null> => {
    const product = await prisma.product.findUnique({
      where: {
        siteId_slug: { siteId, slug },
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                slug: true,
                name: true,
                categoryType: true,
              },
            },
          },
        },
      },
    })

    if (!product) return null

    return toProductWithCategories(product)
  }
)

/**
 * Get featured products for a site.
 *
 * @param siteId - The site ID
 * @param limit - Maximum number of products to return (default: 6)
 * @returns Array of featured product card data
 *
 * @example
 * const featured = await getFeaturedProducts(siteId, 4)
 */
export const getFeaturedProducts = cache(
  async (siteId: string, limit: number = 6): Promise<ProductCardData[]> => {
    const products = await prisma.product.findMany({
      where: {
        siteId,
        status: 'PUBLISHED',
        isActive: true,
        isFeatured: true,
      },
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
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    })

    return products.map(toProductCardData)
  }
)

/**
 * Get products by category.
 *
 * @param siteId - The site ID
 * @param categoryId - The category ID
 * @param limit - Maximum number of products to return (default: 12)
 * @param offset - Number of products to skip (default: 0)
 * @returns Paginated product list response
 *
 * @example
 * const { products } = await getProductsByCategory(siteId, categoryId)
 */
export const getProductsByCategory = cache(
  async (
    siteId: string,
    categoryId: string,
    limit: number = 12,
    offset: number = 0
  ): Promise<ProductListResponse> => {
    const where = {
      siteId,
      status: 'PUBLISHED' as ContentStatus,
      isActive: true,
      categories: {
        some: { categoryId },
      },
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        orderBy: { sortOrder: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products: products.map(toProductCardData),
      total,
      limit,
      offset,
      hasMore: offset + products.length < total,
    }
  }
)

/**
 * Get related products (same product type, excluding current).
 *
 * @param siteId - The site ID
 * @param productId - Current product ID to exclude
 * @param productType - Product type to match
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of related product card data
 *
 * @example
 * const related = await getRelatedProducts(siteId, currentId, 'hotel', 4)
 */
export const getRelatedProducts = cache(
  async (
    siteId: string,
    productId: string,
    productType: string,
    limit: number = 4
  ): Promise<ProductCardData[]> => {
    const products = await prisma.product.findMany({
      where: {
        siteId,
        productType,
        status: 'PUBLISHED',
        isActive: true,
        id: { not: productId },
      },
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
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    })

    return products.map(toProductCardData)
  }
)

/**
 * Batch fetch products by their slugs.
 * Efficient for resolving shortcode references in content.
 *
 * @param siteId - The site ID
 * @param slugs - Array of product slugs to fetch
 * @returns Map of slug to product card data
 *
 * @example
 * const products = await getProductsBySlugs(siteId, ['mouse-x1', 'keyboard-pro'])
 * const mouseProduct = products.get('mouse-x1')
 */
export const getProductsBySlugs = cache(
  async (siteId: string, slugs: string[]): Promise<Map<string, ProductCardData>> => {
    if (slugs.length === 0) {
      return new Map()
    }

    const products = await prisma.product.findMany({
      where: {
        siteId,
        slug: { in: slugs },
        status: 'PUBLISHED',
        isActive: true,
      },
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
    })

    const productMap = new Map<string, ProductCardData>()
    for (const product of products) {
      productMap.set(product.slug, {
        ...toProductCardData(product),
        primaryAffiliateUrl: product.primaryAffiliateUrl,
      } as ProductCardData & { primaryAffiliateUrl: string | null })
    }

    return productMap
  }
)

/**
 * Get products for sidebar recommendations.
 * Supports filtering by category or product type with exclusions.
 *
 * @param siteId - The site ID
 * @param options - Filtering options
 * @returns Array of product card data
 *
 * @example
 * const sidebarProducts = await getSidebarProducts(siteId, {
 *   categoryId: 'cat-123',
 *   excludeIds: ['prod-456', 'prod-789'],
 *   limit: 4,
 * })
 */
export const getSidebarProducts = cache(
  async (
    siteId: string,
    options: {
      categoryId?: string
      productType?: string
      excludeIds?: string[]
      limit?: number
    } = {}
  ): Promise<ProductCardData[]> => {
    const { categoryId, productType, excludeIds = [], limit = 4 } = options

    const where = {
      siteId,
      status: 'PUBLISHED' as ContentStatus,
      isActive: true,
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
      ...(productType && { productType }),
      ...(categoryId && {
        categories: {
          some: { categoryId },
        },
      }),
    }

    const products = await prisma.product.findMany({
      where,
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
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { sortOrder: 'asc' }],
      take: limit,
    })

    return products.map((product) => ({
      ...toProductCardData(product),
      primaryAffiliateUrl: product.primaryAffiliateUrl,
    })) as ProductCardData[]
  }
)

/**
 * Get products by category slug.
 * Used for [products:category-slug] shortcodes in content.
 *
 * @param siteId - The site ID
 * @param categorySlug - The category slug
 * @param limit - Maximum number of products to return (default: 3)
 * @returns Array of product card data
 *
 * @example
 * const products = await getProductsByCategorySlug(siteId, 'gaming-mice', 3)
 */
export const getProductsByCategorySlug = cache(
  async (
    siteId: string,
    categorySlug: string,
    limit: number = 3
  ): Promise<ProductCardData[]> => {
    // First find the category
    const category = await prisma.category.findFirst({
      where: {
        siteId,
        slug: categorySlug,
        isActive: true,
      },
      select: { id: true },
    })

    if (!category) {
      return []
    }

    const products = await prisma.product.findMany({
      where: {
        siteId,
        status: 'PUBLISHED',
        isActive: true,
        categories: {
          some: { categoryId: category.id },
        },
      },
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
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      take: limit,
    })

    return products.map((product) => ({
      ...toProductCardData(product),
      primaryAffiliateUrl: product.primaryAffiliateUrl,
    })) as ProductCardData[]
  }
)
