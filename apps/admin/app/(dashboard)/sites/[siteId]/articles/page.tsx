import { notFound } from 'next/navigation'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, FileText, Search } from 'lucide-react'
import { ArticleFilters } from './ArticleFilters'
import { Pagination } from '@/components/ui/Pagination'

const DEFAULT_PAGE_SIZE = 10

async function getArticles(
  siteId: string,
  searchParams: {
    status?: string
    type?: string
    categoryId?: string
    search?: string
    page?: string
    limit?: string
  }
) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, name: true },
  })

  if (!site) return null

  // Pagination
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const limit = parseInt(searchParams.limit || String(DEFAULT_PAGE_SIZE), 10)
  const skip = (page - 1) * limit

  // Build where clause
  const where: {
    siteId: string
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    articleType?: 'ROUNDUP' | 'REVIEW' | 'COMPARISON' | 'BUYING_GUIDE' | 'HOW_TO'
    articleCategoryId?: string
    OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; slug?: { contains: string; mode: 'insensitive' } }>
  } = {
    siteId,
  }

  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  }

  if (searchParams.type && searchParams.type !== 'all') {
    where.articleType = searchParams.type as 'ROUNDUP' | 'REVIEW' | 'COMPARISON' | 'BUYING_GUIDE' | 'HOW_TO'
  }

  if (searchParams.categoryId && searchParams.categoryId !== 'all') {
    where.articleCategoryId = searchParams.categoryId
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
    (searchParams.type && searchParams.type !== 'all') ||
    (searchParams.categoryId && searchParams.categoryId !== 'all') ||
    searchParams.search
  )

  const [articles, totalCount, articleCategories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        articleCategory: {
          select: { name: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
    prisma.articleCategory.findMany({
      where: { siteId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return { site, articles, articleCategories, totalCount, page, limit, hasFilters }
}

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  ROUNDUP: 'Roundup',
  REVIEW: 'Review',
  COMPARISON: 'Comparison',
  BUYING_GUIDE: 'Buying Guide',
  HOW_TO: 'How To',
}

const ARTICLE_TYPE_COLORS: Record<string, string> = {
  ROUNDUP: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  COMPARISON: 'bg-orange-100 text-orange-700',
  BUYING_GUIDE: 'bg-teal-100 text-teal-700',
  HOW_TO: 'bg-pink-100 text-pink-700',
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>
  searchParams: Promise<{
    status?: string
    type?: string
    categoryId?: string
    search?: string
    page?: string
    limit?: string
  }>
}) {
  const { siteId } = await params
  const resolvedSearchParams = await searchParams
  const data = await getArticles(siteId, resolvedSearchParams)

  if (!data) {
    notFound()
  }

  const { site, articles, articleCategories, totalCount, page, limit, hasFilters } = data

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-500 mt-1">
            Manage articles for {site.name}
          </p>
        </div>
        <Link
          href={`/sites/${siteId}/articles/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <ArticleFilters
        siteId={siteId}
        articleCategories={articleCategories}
        currentFilters={resolvedSearchParams}
      />

      {/* Articles Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {articles.length === 0 ? (
          hasFilters ? (
            // No results matching filters
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500 mb-6">
                No articles match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            // No articles at all
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No articles yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first article to start publishing content.
              </p>
              <Link
                href={`/sites/${siteId}/articles/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Article
              </Link>
            </div>
          )
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {article.featuredImage ? (
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          width={48}
                          height={36}
                          className="w-12 h-9 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {article.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          /{article.slug}
                          {article._count.products > 0 && (
                            <span className="ml-2 text-gray-400">
                              ({article._count.products} products)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        ARTICLE_TYPE_COLORS[article.articleType] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ARTICLE_TYPE_LABELS[article.articleType] || article.articleType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {article.articleCategory?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        article.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : article.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/sites/${siteId}/articles/${article.id}`}
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
