import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { prisma } from '@affiliate/database'
import { CategoryForm, type CategoryFormData } from '@/components/forms/CategoryForm'
import { updateCategory, duplicateCategory } from '../actions'
import { DeleteCategoryButton } from '../DeleteCategoryButton'
import { DuplicateCategoryButton } from './DuplicateCategoryButton'

async function getSiteWithNiche(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      niche: {
        select: {
          id: true,
          name: true,
          categoryTypes: true,
        },
      },
    },
  })

  return site
}

async function getCategory(siteId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      siteId,
    },
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  })

  return category
}

async function getParentCategories(siteId: string) {
  const categories = await prisma.category.findMany({
    where: { siteId },
    select: {
      id: true,
      name: true,
      categoryType: true,
      parentId: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return categories
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ siteId: string; categoryId: string }>
}) {
  const { siteId, categoryId } = await params
  const [site, category, parentCategories] = await Promise.all([
    getSiteWithNiche(siteId),
    getCategory(siteId, categoryId),
    getParentCategories(siteId),
  ])

  if (!site || !category) {
    notFound()
  }

  // Extract category types from niche configuration
  const categoryTypes = (site.niche.categoryTypes as string[]) || []

  // Transform category data to form defaults
  const defaultValues: Partial<CategoryFormData> = {
    name: category.name,
    slug: category.slug,
    categoryType: category.categoryType,
    parentId: category.parentId,
    description: category.description,
    featuredImage: category.featuredImage,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    seoKeywords: category.seoKeywords,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
  }

  async function handleSubmit(data: CategoryFormData) {
    'use server'
    return updateCategory(siteId, categoryId, data)
  }

  async function handleDuplicate() {
    'use server'
    return duplicateCategory(siteId, categoryId)
  }

  // Build the public category URL
  const publicUrl = `https://${site.domain}/categories/${category.slug}`

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/sites/${siteId}/categories`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                  category.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-gray-500">
                {category._count.products} products
              </span>
              {category._count.children > 0 && (
                <span className="text-sm text-gray-500">
                  {category._count.children} subcategories
                </span>
              )}
              {category.isActive && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View on site
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DuplicateCategoryButton onDuplicate={handleDuplicate} siteId={siteId} />
            <DeleteCategoryButton
              categoryId={categoryId}
              categoryName={category.name}
              siteId={siteId}
              hasChildren={category._count.children > 0}
              hasProducts={category._count.products > 0}
              variant="button"
              redirectOnDelete
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <CategoryForm
        siteId={siteId}
        siteName={site.name}
        categoryTypes={categoryTypes}
        parentCategories={parentCategories}
        defaultValues={defaultValues}
        categoryId={categoryId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
