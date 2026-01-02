import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@affiliate/database'
import { CategoryForm, type CategoryFormData } from '@/components/forms/CategoryForm'
import { createCategory } from '../actions'

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

async function getParentCategories(siteId: string) {
  const categories = await prisma.category.findMany({
    where: { siteId, isActive: true },
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

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const [site, parentCategories] = await Promise.all([
    getSiteWithNiche(siteId),
    getParentCategories(siteId),
  ])

  if (!site) {
    notFound()
  }

  // Extract category types from niche configuration
  const categoryTypes = (site.niche.categoryTypes as string[]) || []

  async function handleSubmit(data: CategoryFormData) {
    'use server'
    return createCategory(siteId, data)
  }

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
        <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
        <p className="text-gray-500 mt-1">
          Create a new category for {site.name}
        </p>
      </div>

      {/* Form */}
      <CategoryForm
        siteId={siteId}
        siteName={site.name}
        categoryTypes={categoryTypes}
        parentCategories={parentCategories}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
