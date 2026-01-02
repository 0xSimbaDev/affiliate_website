'use server'

import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@affiliate/database'
import { z } from 'zod'

// FAQ item schema
const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
})

// Article product schema
const articleProductSchema = z.object({
  productId: z.string().min(1),
  position: z.number().int().min(0),
  highlight: z.string().optional().nullable(),
})

// Validation schema matching ArticleForm
const articleSchema = z.object({
  // Content tab
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  excerpt: z.string().max(500, 'Excerpt is too long').optional().nullable(),
  content: z.string().optional().nullable(),
  featuredImage: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  faqs: z.array(faqItemSchema).optional().default([]),

  // Products tab
  products: z.array(articleProductSchema).optional().default([]),

  // SEO tab
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters').optional().nullable(),
  seoDescription: z
    .string()
    .max(160, 'SEO description should be under 160 characters')
    .optional()
    .nullable(),
  seoKeywords: z.array(z.string()).optional().default([]),

  // Settings tab
  articleType: z.enum(['ROUNDUP', 'REVIEW', 'COMPARISON', 'BUYING_GUIDE', 'HOW_TO']).default('ROUNDUP'),
  articleCategoryId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(), // ISO date string
  author: z.string().max(100).optional().nullable(),
})

export type ArticleInput = z.infer<typeof articleSchema>

export async function createArticle(
  siteId: string,
  data: ArticleInput
): Promise<{ success: boolean; error?: string; articleId?: string }> {
  try {
    // Validate input
    const validated = articleSchema.parse(data)

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    // Check if slug is unique for this site
    const existingArticle = await prisma.article.findUnique({
      where: {
        siteId_slug: {
          siteId,
          slug: validated.slug,
        },
      },
    })

    if (existingArticle) {
      return { success: false, error: 'An article with this slug already exists' }
    }

    // Parse publishedAt if provided
    let publishedAt: Date | null = null
    if (validated.publishedAt) {
      publishedAt = new Date(validated.publishedAt)
    } else if (validated.status === 'PUBLISHED') {
      publishedAt = new Date()
    }

    // Create the article
    const article = await prisma.article.create({
      data: {
        siteId,
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt || null,
        content: validated.content || null,
        featuredImage: validated.featuredImage || null,
        faqs: validated.faqs.length > 0 ? validated.faqs : Prisma.JsonNull,
        author: validated.author || null,
        seoTitle: validated.seoTitle || null,
        seoDescription: validated.seoDescription || null,
        seoKeywords: validated.seoKeywords,
        articleType: validated.articleType,
        articleCategoryId: validated.articleCategoryId || null,
        status: validated.status,
        isFeatured: validated.isFeatured,
        publishedAt,
      },
    })

    // Create article-product relationships
    if (validated.products.length > 0) {
      await prisma.articleProduct.createMany({
        data: validated.products.map((product) => ({
          articleId: article.id,
          productId: product.productId,
          position: product.position,
          highlight: product.highlight || null,
        })),
      })
    }

    revalidatePath(`/sites/${siteId}/articles`)
    return { success: true, articleId: article.id }
  } catch (error) {
    console.error('Failed to create article:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to create article' }
  }
}

export async function updateArticle(
  siteId: string,
  articleId: string,
  data: ArticleInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validated = articleSchema.parse(data)

    // Check if article exists and belongs to this site
    const existingArticle = await prisma.article.findFirst({
      where: {
        id: articleId,
        siteId,
      },
    })

    if (!existingArticle) {
      return { success: false, error: 'Article not found' }
    }

    // Check if slug is unique (excluding current article)
    const slugConflict = await prisma.article.findFirst({
      where: {
        siteId,
        slug: validated.slug,
        NOT: { id: articleId },
      },
    })

    if (slugConflict) {
      return { success: false, error: 'An article with this slug already exists' }
    }

    // Parse publishedAt
    let publishedAt: Date | null = existingArticle.publishedAt
    if (validated.publishedAt) {
      publishedAt = new Date(validated.publishedAt)
    } else if (validated.status === 'PUBLISHED' && !existingArticle.publishedAt) {
      publishedAt = new Date()
    }

    // Update the article
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt || null,
        content: validated.content || null,
        featuredImage: validated.featuredImage || null,
        faqs: validated.faqs.length > 0 ? validated.faqs : Prisma.JsonNull,
        author: validated.author || null,
        seoTitle: validated.seoTitle || null,
        seoDescription: validated.seoDescription || null,
        seoKeywords: validated.seoKeywords,
        articleType: validated.articleType,
        articleCategoryId: validated.articleCategoryId || null,
        status: validated.status,
        isFeatured: validated.isFeatured,
        publishedAt,
      },
    })

    // Update article-product relationships
    // First, remove all existing relationships
    await prisma.articleProduct.deleteMany({
      where: { articleId },
    })

    // Then create new ones
    if (validated.products.length > 0) {
      await prisma.articleProduct.createMany({
        data: validated.products.map((product) => ({
          articleId,
          productId: product.productId,
          position: product.position,
          highlight: product.highlight || null,
        })),
      })
    }

    revalidatePath(`/sites/${siteId}/articles`)
    revalidatePath(`/sites/${siteId}/articles/${articleId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update article:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update article' }
  }
}

export async function deleteArticle(
  siteId: string,
  articleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if article exists and belongs to this site
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        siteId,
      },
    })

    if (!article) {
      return { success: false, error: 'Article not found' }
    }

    // Delete the article (cascades to ArticleProduct)
    await prisma.article.delete({
      where: { id: articleId },
    })

    revalidatePath(`/sites/${siteId}/articles`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete article:', error)
    return { success: false, error: 'Failed to delete article' }
  }
}

export async function duplicateArticle(
  siteId: string,
  articleId: string
): Promise<{ success: boolean; error?: string; newArticleId?: string }> {
  try {
    // Get the original article with products
    const original = await prisma.article.findFirst({
      where: {
        id: articleId,
        siteId,
      },
      include: {
        products: true,
      },
    })

    if (!original) {
      return { success: false, error: 'Article not found' }
    }

    // Generate a unique slug
    let newSlug = `${original.slug}-copy`
    let counter = 1
    while (
      await prisma.article.findUnique({
        where: { siteId_slug: { siteId, slug: newSlug } },
      })
    ) {
      newSlug = `${original.slug}-copy-${counter}`
      counter++
    }

    // Create the duplicate
    const newArticle = await prisma.article.create({
      data: {
        siteId,
        title: `${original.title} (Copy)`,
        slug: newSlug,
        excerpt: original.excerpt,
        content: original.content,
        featuredImage: original.featuredImage,
        faqs: original.faqs ?? Prisma.JsonNull,
        author: original.author,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        seoKeywords: original.seoKeywords,
        articleType: original.articleType,
        articleCategoryId: original.articleCategoryId,
        status: 'DRAFT', // Always create as draft
        isFeatured: false, // Don't duplicate featured status
      },
    })

    // Copy product relationships
    if (original.products.length > 0) {
      await prisma.articleProduct.createMany({
        data: original.products.map((ap) => ({
          articleId: newArticle.id,
          productId: ap.productId,
          position: ap.position,
          highlight: ap.highlight,
        })),
      })
    }

    revalidatePath(`/sites/${siteId}/articles`)
    return { success: true, newArticleId: newArticle.id }
  } catch (error) {
    console.error('Failed to duplicate article:', error)
    return { success: false, error: 'Failed to duplicate article' }
  }
}

// Search products for the article form
export async function searchProducts(
  siteId: string,
  query: string
): Promise<{ id: string; title: string; featuredImage: string | null; slug: string }[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        siteId,
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        featuredImage: true,
        slug: true,
      },
      take: 10,
      orderBy: { title: 'asc' },
    })

    return products
  } catch (error) {
    console.error('Failed to search products:', error)
    return []
  }
}
