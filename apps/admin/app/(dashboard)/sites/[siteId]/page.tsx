import { notFound } from 'next/navigation'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import {
  Package,
  FileText,
  FolderOpen,
  Image,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'

async function getSiteWithStats(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      niche: { select: { name: true } },
      _count: {
        select: {
          products: true,
          articles: true,
          categories: true,
          media: true,
        },
      },
    },
  })

  if (!site) return null

  // Get recent activity
  const recentProducts = await prisma.product.findMany({
    where: { siteId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, status: true, updatedAt: true },
  })

  const recentArticles = await prisma.article.findMany({
    where: { siteId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, status: true, updatedAt: true },
  })

  // Get status counts
  const publishedProducts = await prisma.product.count({
    where: { siteId, status: 'PUBLISHED' },
  })

  const publishedArticles = await prisma.article.count({
    where: { siteId, status: 'PUBLISHED' },
  })

  return {
    site,
    recentProducts,
    recentArticles,
    stats: {
      publishedProducts,
      draftProducts: site._count.products - publishedProducts,
      publishedArticles,
      draftArticles: site._count.articles - publishedArticles,
    },
  }
}

export default async function SiteDashboardPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const data = await getSiteWithStats(siteId)

  if (!data) {
    notFound()
  }

  const { site, recentProducts, recentArticles, stats } = data

  const statCards = [
    {
      label: 'Products',
      value: site._count.products,
      subtext: `${stats.publishedProducts} published`,
      icon: Package,
      href: `/sites/${siteId}/products`,
      color: 'bg-blue-500',
    },
    {
      label: 'Articles',
      value: site._count.articles,
      subtext: `${stats.publishedArticles} published`,
      icon: FileText,
      href: `/sites/${siteId}/articles`,
      color: 'bg-purple-500',
    },
    {
      label: 'Categories',
      value: site._count.categories,
      subtext: 'Active categories',
      icon: FolderOpen,
      href: `/sites/${siteId}/categories`,
      color: 'bg-green-500',
    },
    {
      label: 'Media',
      value: site._count.media,
      subtext: 'Uploaded files',
      icon: Image,
      href: `/sites/${siteId}/media`,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Site Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            {site.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-sm text-gray-500">{site.domain}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-white rounded-lg border p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/sites/${siteId}/products/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors"
          >
            <Package className="w-4 h-4 text-gray-500" />
            New Product
          </Link>
          <Link
            href={`/sites/${siteId}/articles/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            New Article
          </Link>
          <Link
            href={`/sites/${siteId}/media`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors"
          >
            <Image className="w-4 h-4 text-gray-500" />
            Upload Media
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="bg-white rounded-lg border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Products</h3>
            <Link
              href={`/sites/${siteId}/products`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No products yet
              </div>
            ) : (
              recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/sites/${siteId}/products/${product.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-lg border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Articles</h3>
            <Link
              href={`/sites/${siteId}/articles`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentArticles.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No articles yet
              </div>
            ) : (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/sites/${siteId}/articles/${article.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          article.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : article.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {article.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
