'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@affiliate/database'
import { z } from 'zod'

// Validation schema matching CategoryForm
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  categoryType: z.string().min(1, 'Category type is required'),
  parentId: z.string().nullable().optional(),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  featuredImage: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters').optional().nullable(),
  seoDescription: z
    .string()
    .max(160, 'SEO description should be under 160 characters')
    .optional()
    .nullable(),
  seoKeywords: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

export type CategoryInput = z.infer<typeof categorySchema>

export async function createCategory(
  siteId: string,
  data: CategoryInput
): Promise<{ success: boolean; error?: string; categoryId?: string }> {
  try {
    // Validate input
    const validated = categorySchema.parse(data)

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    // Check if slug is unique for this site and category type
    const existingCategory = await prisma.category.findUnique({
      where: {
        siteId_categoryType_slug: {
          siteId,
          categoryType: validated.categoryType,
          slug: validated.slug,
        },
      },
    })

    if (existingCategory) {
      return { success: false, error: 'A category with this slug already exists for this type' }
    }

    // Validate parent category if provided
    if (validated.parentId) {
      const parentCategory = await prisma.category.findFirst({
        where: {
          id: validated.parentId,
          siteId,
        },
      })

      if (!parentCategory) {
        return { success: false, error: 'Parent category not found' }
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        siteId,
        name: validated.name,
        slug: validated.slug,
        categoryType: validated.categoryType,
        parentId: validated.parentId || null,
        description: validated.description || null,
        featuredImage: validated.featuredImage || null,
        seoTitle: validated.seoTitle || null,
        seoDescription: validated.seoDescription || null,
        seoKeywords: validated.seoKeywords,
        isActive: validated.isActive,
        sortOrder: validated.sortOrder,
      },
    })

    revalidatePath(`/sites/${siteId}/categories`)
    return { success: true, categoryId: category.id }
  } catch (error) {
    console.error('Failed to create category:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(
  siteId: string,
  categoryId: string,
  data: CategoryInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validated = categorySchema.parse(data)

    // Check if category exists and belongs to this site
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        siteId,
      },
    })

    if (!existingCategory) {
      return { success: false, error: 'Category not found' }
    }

    // Check if slug is unique (excluding current category)
    const slugConflict = await prisma.category.findFirst({
      where: {
        siteId,
        categoryType: validated.categoryType,
        slug: validated.slug,
        NOT: { id: categoryId },
      },
    })

    if (slugConflict) {
      return { success: false, error: 'A category with this slug already exists for this type' }
    }

    // Validate parent category if provided
    if (validated.parentId) {
      // Prevent setting self as parent
      if (validated.parentId === categoryId) {
        return { success: false, error: 'A category cannot be its own parent' }
      }

      const parentCategory = await prisma.category.findFirst({
        where: {
          id: validated.parentId,
          siteId,
        },
      })

      if (!parentCategory) {
        return { success: false, error: 'Parent category not found' }
      }

      // Prevent circular references by checking if the potential parent is a descendant
      const isDescendant = await checkIsDescendant(categoryId, validated.parentId)
      if (isDescendant) {
        return { success: false, error: 'Cannot set a child category as parent (circular reference)' }
      }
    }

    // Update the category
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: validated.name,
        slug: validated.slug,
        categoryType: validated.categoryType,
        parentId: validated.parentId || null,
        description: validated.description || null,
        featuredImage: validated.featuredImage || null,
        seoTitle: validated.seoTitle || null,
        seoDescription: validated.seoDescription || null,
        seoKeywords: validated.seoKeywords,
        isActive: validated.isActive,
        sortOrder: validated.sortOrder,
      },
    })

    revalidatePath(`/sites/${siteId}/categories`)
    revalidatePath(`/sites/${siteId}/categories/${categoryId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update category:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update category' }
  }
}

// Helper function to check if potentialDescendant is a descendant of categoryId
async function checkIsDescendant(categoryId: string, potentialDescendant: string): Promise<boolean> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  })

  for (const child of children) {
    if (child.id === potentialDescendant) {
      return true
    }
    const isDescendant = await checkIsDescendant(child.id, potentialDescendant)
    if (isDescendant) {
      return true
    }
  }

  return false
}

export async function deleteCategory(
  siteId: string,
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if category exists and belongs to this site
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        siteId,
      },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })

    if (!category) {
      return { success: false, error: 'Category not found' }
    }

    // If category has children, update them to point to this category's parent
    if (category._count.children > 0) {
      await prisma.category.updateMany({
        where: { parentId: categoryId },
        data: { parentId: category.parentId },
      })
    }

    // Delete the category (ProductCategory relations will cascade)
    await prisma.category.delete({
      where: { id: categoryId },
    })

    revalidatePath(`/sites/${siteId}/categories`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function updateCategorySortOrder(
  siteId: string,
  categoryId: string,
  newSortOrder: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if category exists and belongs to this site
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        siteId,
      },
    })

    if (!category) {
      return { success: false, error: 'Category not found' }
    }

    // Update sort order
    await prisma.category.update({
      where: { id: categoryId },
      data: { sortOrder: newSortOrder },
    })

    revalidatePath(`/sites/${siteId}/categories`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update category sort order:', error)
    return { success: false, error: 'Failed to update sort order' }
  }
}

export async function duplicateCategory(
  siteId: string,
  categoryId: string
): Promise<{ success: boolean; error?: string; newCategoryId?: string }> {
  try {
    // Get the original category
    const original = await prisma.category.findFirst({
      where: {
        id: categoryId,
        siteId,
      },
    })

    if (!original) {
      return { success: false, error: 'Category not found' }
    }

    // Generate a unique slug
    let newSlug = `${original.slug}-copy`
    let counter = 1
    while (
      await prisma.category.findUnique({
        where: {
          siteId_categoryType_slug: {
            siteId,
            categoryType: original.categoryType,
            slug: newSlug,
          },
        },
      })
    ) {
      newSlug = `${original.slug}-copy-${counter}`
      counter++
    }

    // Create the duplicate
    const newCategory = await prisma.category.create({
      data: {
        siteId,
        name: `${original.name} (Copy)`,
        slug: newSlug,
        categoryType: original.categoryType,
        parentId: original.parentId,
        description: original.description,
        featuredImage: original.featuredImage,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        seoKeywords: original.seoKeywords,
        isActive: false, // Create as inactive
        sortOrder: original.sortOrder,
      },
    })

    revalidatePath(`/sites/${siteId}/categories`)
    return { success: true, newCategoryId: newCategory.id }
  } catch (error) {
    console.error('Failed to duplicate category:', error)
    return { success: false, error: 'Failed to duplicate category' }
  }
}
