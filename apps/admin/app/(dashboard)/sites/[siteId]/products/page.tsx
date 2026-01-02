import { notFound } from 'next/navigation'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'
import { ProductFilters } from './ProductFilters'

const DEFAULT_PAGE_SIZE = 10

async function getProducts(
  siteId: string,
  searchParams: {
    page?: string
    limit?: string
    status?: string
    categoryId?: string
    search?: string
  }
) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, name: true },
  })

  if (!site) return null

  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const limit = parseInt(searchParams.limit || String(DEFAULT_PAGE_SIZE), 10)
  const skip = (page - 1) * limit

  // Build where clause for filtering
  const where: {
    siteId: string
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    categories?: { some: { categoryId: string } }
    OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; slug?: { contains: string; mode: 'insensitive' } }>
  } = {
    siteId,
  }

  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  }

  if (searchParams.categoryId && searchParams.categoryId !== 'all') {
    where.categories = {
      some: { categoryId: searchParams.categoryId },
    }
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { slug: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  // Check if any filters are applied
  const hasFilters = !!(
    (searchParams.status && searchParams.status !== 'all') ||
    (searchParams.categoryId && searchParams.categoryId !== 'all') ||
    searchParams.search
  )

  const [products, totalCount, categories, totalProductsCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: { select: { name: true } },
          },
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({
      where,
    }),
    prisma.category.findMany({
      where: { siteId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    // Only fetch total products count if filters are applied
    hasFilters ? prisma.product.count({ where: { siteId } }) : Promise.resolve(0),
  ])

  return { site, products, totalCount, page, limit, categories, hasFilters, totalProductsCount }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>
  searchParams: Promise<{ page?: string; limit?: string; status?: string; categoryId?: string; search?: string }>
}) {
  const { siteId } = await params
  const resolvedSearchParams = await searchParams
  const data = await getProducts(siteId, resolvedSearchParams)

  if (!data) {
    notFound()
  }

  const { site, products, totalCount, page, limit, categories, hasFilters } = data

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage products for {site.name}
          </p>
        </div>
        <Link
          href={`/sites/${siteId}/products/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters
        siteId={siteId}
        categories={categories}
        currentFilters={{
          status: resolvedSearchParams.status,
          categoryId: resolvedSearchParams.categoryId,
          search: resolvedSearchParams.search,
        }}
      />

      {/* Products Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {products.length === 0 ? (
          hasFilters ? (
            // No results matching filters
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                No products match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            // No products at all
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first product to start building your catalog.
              </p>
              <Link
                href={`/sites/${siteId}/products/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Product
              </Link>
            </div>
          )
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          width={48}
                          height={36}
                          className="w-12 h-9 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {product.categories[0]?.category.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        product.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : product.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {product.rating ? `${product.rating}/5` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/sites/${siteId}/products/${product.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={page}
          totalItems={totalCount}
          pageSize={limit}
        />
      )}
    </div>
  )
}
