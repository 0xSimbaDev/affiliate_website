import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Copy, Trash2 } from 'lucide-react'
import { prisma } from '@affiliate/database'
import { ProductForm, type ProductFormData } from '@/components/forms/ProductForm'
import { updateProduct, deleteProduct, duplicateProduct } from '../actions'
import { DeleteProductButton } from './DeleteProductButton'
import { DuplicateProductButton } from './DuplicateProductButton'

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

async function getProduct(siteId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      siteId,
    },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  return product
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

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ siteId: string; productId: string }>
}) {
  const { siteId, productId } = await params
  const [site, product, categories] = await Promise.all([
    getSiteWithNiche(siteId),
    getProduct(siteId, productId),
    getCategories(siteId),
  ])

  if (!site || !product) {
    notFound()
  }

  // Extract product types from niche configuration
  const productTypes = (site.niche.productTypes as Array<{ slug: string; label: string }>) || []

  // Find the primary category
  const primaryCategory = product.categories.find((pc) => pc.isPrimary)

  // Transform product data to form defaults
  const defaultValues: Partial<ProductFormData> = {
    title: product.title,
    slug: product.slug,
    excerpt: product.excerpt,
    description: product.description,
    content: product.content,
    featuredImage: product.featuredImage,
    priceFrom: product.priceFrom ? Number(product.priceFrom) : null,
    priceTo: product.priceTo ? Number(product.priceTo) : null,
    priceCurrency: product.priceCurrency || 'USD',
    priceText: product.priceText,
    rating: product.rating ? Number(product.rating) : null,
    reviewCount: product.reviewCount,
    affiliateLinks: (product.affiliateLinks as Array<{
      partner: string
      url: string
      label?: string
    }>) || [],
    primaryAffiliateUrl: product.primaryAffiliateUrl,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    productType: product.productType,
    categoryIds: product.categories.map((pc) => pc.categoryId),
    primaryCategoryId: primaryCategory?.categoryId || null,
    status: product.status,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
  }

  async function handleSubmit(data: ProductFormData) {
    'use server'
    return updateProduct(siteId, productId, data)
  }

  async function handleDelete() {
    'use server'
    return deleteProduct(siteId, productId)
  }

  async function handleDuplicate() {
    'use server'
    return duplicateProduct(siteId, productId)
  }

  // Build the public product URL
  const publicUrl = `https://${site.domain}/products/${product.slug}`

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                  product.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-700'
                    : product.status === 'DRAFT'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {product.status}
              </span>
              {product.status === 'PUBLISHED' && (
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
            <DuplicateProductButton onDuplicate={handleDuplicate} siteId={siteId} />
            <DeleteProductButton onDelete={handleDelete} productTitle={product.title} siteId={siteId} />
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        siteId={siteId}
        siteName={site.name}
        productTypes={productTypes}
        categories={categories}
        defaultValues={defaultValues}
        productId={productId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
