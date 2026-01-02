import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import {
  Package,
  FileText,
  CheckCircle,
  Clock,
  Upload,
  ArrowRight,
} from 'lucide-react'

async function getDashboardStats(userId: string, role: string) {
  // Get sites for this user
  let siteIds: string[]

  if (role === 'ADMIN') {
    const sites = await prisma.site.findMany({ select: { id: true } })
    siteIds = sites.map((s) => s.id)
  } else {
    const userSites = await prisma.userSite.findMany({
      where: { userId },
      select: { siteId: true },
    })
    siteIds = userSites.map((us) => us.siteId)
  }

  if (siteIds.length === 0) {
    return {
      productsCount: 0,
      articlesCount: 0,
      publishedCount: 0,
      draftsCount: 0,
      productsToday: 0,
      articlesToday: 0,
      publishedToday: 0,
      draftsToday: 0,
      recentActivity: [],
    }
  }

  // Get today's date range
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  // Run all counts in parallel
  const [
    productsCount,
    articlesCount,
    publishedProductsCount,
    publishedArticlesCount,
    draftProductsCount,
    draftArticlesCount,
    productsToday,
    articlesToday,
    publishedProductsToday,
    publishedArticlesToday,
    draftProductsToday,
    draftArticlesToday,
    recentActivity,
  ] = await Promise.all([
    // Total counts
    prisma.product.count({
      where: { siteId: { in: siteIds } },
    }),
    prisma.article.count({
      where: { siteId: { in: siteIds } },
    }),
    prisma.product.count({
      where: { siteId: { in: siteIds }, status: 'PUBLISHED' },
    }),
    prisma.article.count({
      where: { siteId: { in: siteIds }, status: 'PUBLISHED' },
    }),
    prisma.product.count({
      where: { siteId: { in: siteIds }, status: 'DRAFT' },
    }),
    prisma.article.count({
      where: { siteId: { in: siteIds }, status: 'DRAFT' },
    }),
    // Today's counts
    prisma.product.count({
      where: {
        siteId: { in: siteIds },
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.article.count({
      where: {
        siteId: { in: siteIds },
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.product.count({
      where: {
        siteId: { in: siteIds },
        status: 'PUBLISHED',
        publishedAt: { gte: startOfDay },
      },
    }),
    prisma.article.count({
      where: {
        siteId: { in: siteIds },
        status: 'PUBLISHED',
        publishedAt: { gte: startOfDay },
      },
    }),
    prisma.product.count({
      where: {
        siteId: { in: siteIds },
        status: 'DRAFT',
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.article.count({
      where: {
        siteId: { in: siteIds },
        status: 'DRAFT',
        createdAt: { gte: startOfDay },
      },
    }),
    // Recent activity from audit logs
    prisma.auditLog.findMany({
      where: {
        userId,
        entityType: { in: ['product', 'article', 'category', 'media'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, image: true } },
        site: { select: { name: true } },
      },
    }),
  ])

  return {
    productsCount,
    articlesCount,
    publishedCount: publishedProductsCount + publishedArticlesCount,
    draftsCount: draftProductsCount + draftArticlesCount,
    productsToday,
    articlesToday,
    publishedToday: publishedProductsToday + publishedArticlesToday,
    draftsToday: draftProductsToday + draftArticlesToday,
    recentActivity,
  }
}

function formatActionText(action: string, entityType: string): string {
  const actionMap: Record<string, string> = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    PUBLISH: 'published',
    UNPUBLISH: 'unpublished',
  }

  return `${actionMap[action] || action.toLowerCase()} a ${entityType}`
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const stats = await getDashboardStats(session.user.id, session.user.role)

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const statCards = [
    {
      label: 'Products',
      value: stats.productsCount,
      trend: stats.productsToday,
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Articles',
      value: stats.articlesCount,
      trend: stats.articlesToday,
      icon: FileText,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Published',
      value: stats.publishedCount,
      trend: stats.publishedToday,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Drafts',
      value: stats.draftsCount,
      trend: stats.draftsToday,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ]

  const quickActions = [
    {
      label: 'New Product',
      href: '/sites',
      description: 'Select a site to create a product',
      icon: Package,
    },
    {
      label: 'New Article',
      href: '/sites',
      description: 'Select a site to create an article',
      icon: FileText,
    },
    {
      label: 'Upload Media',
      href: '/sites',
      description: 'Select a site to upload media',
      icon: Upload,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session.user.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s what&apos;s happening with your sites
            </p>
          </div>
          <div className="text-sm text-gray-500">{currentDate}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            {stat.trend > 0 && (
              <p className="text-xs text-green-600 mt-1">+{stat.trend} today</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 bg-white rounded-lg border p-4 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-lg border">
          {stats.recentActivity.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">
                Your actions will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {activity.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {activity.user.name || 'Unknown'}
                      </span>{' '}
                      {formatActionText(activity.action, activity.entityType)}
                      {activity.site && (
                        <span className="text-gray-500">
                          {' '}
                          in {activity.site.name}
                        </span>
                      )}
                    </p>
                    {activity.changes &&
                      typeof activity.changes === 'object' &&
                      'title' in (activity.changes as Record<string, unknown>) && (
                        <p className="text-sm text-gray-500 truncate">
                          &quot;{String((activity.changes as Record<string, unknown>).title)}&quot;
                        </p>
                      )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
