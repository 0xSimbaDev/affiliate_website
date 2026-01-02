import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@affiliate/database'
import { ProductForm, type ProductFormData } from '@/components/forms/ProductForm'
import { createProduct } from '../actions'

async function getSiteWithNiche(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      niche: {
        select: {
          id: true,
          name: true,
          productTypes: true,
        },
      },
    },
  })

  return site
}

async function getCategories(siteId: string) {
  const categories = await prisma.category.findMany({
    where: { siteId, isActive: true },
    select: {
      id: true,
      name: true,
      categoryType: true,
      parentId: true,
    },
    orderBy: [{ categoryType: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

  return categories
}

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const [site, categories] = await Promise.all([
    getSiteWithNiche(siteId),
    getCategories(siteId),
  ])

  if (!site) {
    notFound()
  }

  // Extract product types from niche configuration
  const productTypes = (site.niche.productTypes as Array<{ slug: string; label: string }>) || []

  async function handleSubmit(data: ProductFormData) {
    'use server'
    return createProduct(siteId, data)
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/sites/${siteId}/products`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <p className="text-gray-500 mt-1">
          Create a new product for {site.name}
        </p>
      </div>

      {/* Form */}
      <ProductForm
        siteId={siteId}
        siteName={site.name}
        productTypes={productTypes}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
