'use server'

import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@affiliate/database'
import { z } from 'zod'

// Validation schema matching ProductForm
const affiliateLinkSchema = z.object({
  partner: z.string().min(1),
  url: z.string().url(),
  label: z.string().optional(),
})

const productSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  featuredImage: z.string().url().optional().nullable().or(z.literal('')),
  priceFrom: z.coerce.number().min(0).optional().nullable(),
  priceTo: z.coerce.number().min(0).optional().nullable(),
  priceCurrency: z.string().default('USD'),
  priceText: z.string().max(100).optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().min(0).optional().nullable(),
  affiliateLinks: z.array(affiliateLinkSchema).optional().default([]),
  primaryAffiliateUrl: z.string().url().optional().nullable().or(z.literal('')),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.array(z.string()).optional().default([]),
  productType: z.string().min(1),
  categoryIds: z.array(z.string()).optional().default([]),
  primaryCategoryId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

type ProductInput = z.infer<typeof productSchema>

export async function createProduct(
  siteId: string,
  data: ProductInput
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    // Validate input
    const validated = productSchema.parse(data)

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    // Check if slug is unique for this site
    const existingProduct = await prisma.product.findUnique({
      where: {
        siteId_slug: {
          siteId,
          slug: validated.slug,
        },
      },
    })

    if (existingProduct) {
      return { success: false, error: 'A product with this slug already exists' }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        siteId,
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt || null,
        description: validated.description || null,
        content: validated.content || null,
        featuredImage: validated.featuredImage || null,
        priceFrom: validated.priceFrom
          ? new Prisma.Decimal(validated.priceFrom)
          : null,
        priceTo: validated.priceTo
          ? new Prisma.Decimal(validated.priceTo)
          : null,
        priceCurrency: validated.priceCurrency,
        priceText: validated.priceText || null,
        rating: validated.rating
          ? new Prisma.Decimal(validated.rating)
          : null,
        reviewCount: validated.reviewCount || null,
        affiliateLinks: validated.affiliateLinks.length > 0
          ? validated.affiliateLinks
          : Prisma.JsonNull,
        primaryAffiliateUrl: validated.primaryAffiliateUrl || null,
        seoTitle: validated.seoTitle || null,
        seoDescription: validated.seoDescription || null,
        seoKeywords: validated.seoKeywords,
        productType: validated.productType,
        status: validated.status,
        isFeatured: validated.isFeatured,
        isActive: validated.isActive,
        sortOrder: validated.sortOrder,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
      },
    })

    // Create category relationships
    if (validated.categoryIds.length > 0) {
      await prisma.productCategory.createMany({
        data: validated.categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
          isPrimary: categoryId === validated.primaryCategoryId,
        })),
      })
    }

    revalidatePath(`/sites/${siteId}/products`)
    return { success: true, productId: product.id }
  } catch (error) {
    console.error('Failed to create product:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(
  siteId: string,
  productId: string,
  data: ProductInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validated = productSchema.parse(data)

    // Check if product exists and belongs to this site
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        siteId,
      },
    })

    if (!existingProduct) {
      return { success: false, error: 'Product not found' }
    }

    // Check if slug is unique (excluding current product)
    const slugConflict = await prisma.product.findFirst({
      where: {
        siteId,
        slug: validated.slug,
        NOT: { id: productId },
      },
    })

    if (slugConflict) {
      return { success: false, error: 'A product with this slug already exists' }
    }

    // Update the product
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt || null,
        description: validated.description || null,
        content: validated.content || null,
        featuredImage: validated.featuredImage || null,
        priceFrom: validated.priceFrom
          ? new Prisma.Decimal(validated.priceFrom)
          : null,
        priceTo: validated.priceTo
          ? new Prisma.Decimal(validated.priceTo)
          : null,
        priceCurrency: validated.priceCurrency,
        priceText: validated.priceText || null,
        rating: validated.rating
          ? new Prisma.Decimal(validated.rating)
          : null,
        reviewCount: validated.reviewCount || null,
        affiliateLinks: validated.affiliateLinks.length > 0
          ? validated.affiliateLinks
          : Prisma.JsonNull,
        primaryAffiliateUrl: validated.primaryAffiliateUrl || null,
        seoTitle: validated.seoTitle || null,
        seoDescription: validated.seoDescription || null,
        seoKeywords: validated.seoKeywords,
        productType: validated.productType,
        status: validated.status,
        isFeatured: validated.isFeatured,
        isActive: validated.isActive,
        sortOrder: validated.sortOrder,
        publishedAt:
          validated.status === 'PUBLISHED' && !existingProduct.publishedAt
            ? new Date()
            : existingProduct.publishedAt,
      },
    })

    // Update category relationships
    // First, remove all existing relationships
    await prisma.productCategory.deleteMany({
      where: { productId },
    })

    // Then create new ones
    if (validated.categoryIds.length > 0) {
      await prisma.productCategory.createMany({
        data: validated.categoryIds.map((categoryId) => ({
          productId,
          categoryId,
          isPrimary: categoryId === validated.primaryCategoryId,
        })),
      })
    }

    revalidatePath(`/sites/${siteId}/products`)
    revalidatePath(`/sites/${siteId}/products/${productId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update product:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(
  siteId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if product exists and belongs to this site
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        siteId,
      },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Delete the product (cascades to ProductCategory)
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath(`/sites/${siteId}/products`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

export async function duplicateProduct(
  siteId: string,
  productId: string
): Promise<{ success: boolean; error?: string; newProductId?: string }> {
  try {
    // Get the original product with categories
    const original = await prisma.product.findFirst({
      where: {
        id: productId,
        siteId,
      },
      include: {
        categories: true,
      },
    })

    if (!original) {
      return { success: false, error: 'Product not found' }
    }

    // Generate a unique slug
    let newSlug = `${original.slug}-copy`
    let counter = 1
    while (
      await prisma.product.findUnique({
        where: { siteId_slug: { siteId, slug: newSlug } },
      })
    ) {
      newSlug = `${original.slug}-copy-${counter}`
      counter++
    }

    // Create the duplicate
    const newProduct = await prisma.product.create({
      data: {
        siteId,
        title: `${original.title} (Copy)`,
        slug: newSlug,
        excerpt: original.excerpt,
        description: original.description,
        content: original.content,
        featuredImage: original.featuredImage,
        galleryImages: original.galleryImages,
        priceFrom: original.priceFrom,
        priceTo: original.priceTo,
        priceCurrency: original.priceCurrency,
        priceText: original.priceText,
        rating: original.rating,
        reviewCount: original.reviewCount,
        affiliateLinks: original.affiliateLinks ?? Prisma.JsonNull,
        primaryAffiliateUrl: original.primaryAffiliateUrl,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        seoKeywords: original.seoKeywords,
        metadata: original.metadata ?? Prisma.JsonNull,
        productType: original.productType,
        status: 'DRAFT', // Always create as draft
        isFeatured: false, // Don't duplicate featured status
        isActive: original.isActive,
        sortOrder: original.sortOrder,
      },
    })

    // Copy category relationships
    if (original.categories.length > 0) {
      await prisma.productCategory.createMany({
        data: original.categories.map((pc) => ({
          productId: newProduct.id,
          categoryId: pc.categoryId,
          isPrimary: pc.isPrimary,
        })),
      })
    }

    revalidatePath(`/sites/${siteId}/products`)
    return { success: true, newProductId: newProduct.id }
  } catch (error) {
    console.error('Failed to duplicate product:', error)
    return { success: false, error: 'Failed to duplicate product' }
  }
}
