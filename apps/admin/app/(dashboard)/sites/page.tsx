import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import { Plus, Globe, ArrowRight, Package, FileText } from 'lucide-react'

async function getSitesForUser(userId: string, role: string) {
  if (role === 'ADMIN') {
    // Admins can see all sites
    return prisma.site.findMany({
      include: {
        niche: { select: { name: true } },
        _count: {
          select: {
            products: true,
            articles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  // Regular users only see their assigned sites
  const userSites = await prisma.userSite.findMany({
    where: { userId },
    include: {
      site: {
        include: {
          niche: { select: { name: true } },
          _count: {
            select: {
              products: true,
              articles: true,
            },
          },
        },
      },
    },
  })

  return userSites.map((us) => us.site)
}

export default async function SitesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const sites = await getSitesForUser(session.user.id, session.user.role)
  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? 'Manage all affiliate sites on the platform'
              : 'Manage your affiliate sites'}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/sites/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Site
          </Link>
        )}
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-500 mb-6">
            {isAdmin
              ? 'Create your first affiliate site to get started.'
              : 'Contact your administrator to get access to sites.'}
          </p>
          {isAdmin && (
            <Link
              href="/sites/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Site
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/sites/${site.id}`}
              className="group bg-white rounded-lg border p-6 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                  {site.name.charAt(0).toUpperCase()}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                {site.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{site.domain}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {site._count.products} products
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {site._count.articles} articles
                </div>
              </div>

              {site.niche && (
                <div className="mt-4 pt-4 border-t">
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    {site.niche.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
