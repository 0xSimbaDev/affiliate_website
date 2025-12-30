import { prisma } from '@affiliate/database'

async function getSites() {
  return prisma.site.findMany({
    include: {
      niche: true,
      _count: {
        select: {
          products: true,
          articles: true,
          categories: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export default async function SitesPage() {
  const sites = await getSites()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Sites</h1>
        <p className="text-muted-foreground mt-1">
          Manage all sites in your affiliate platform
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Domain</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Niche</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Products</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Articles</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Categories</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{site.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{site.domain}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{site.niche.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{site._count.products}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{site._count.articles}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{site._count.categories}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sites.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No sites found. Create your first site to get started.
          </div>
        )}
      </div>
    </div>
  )
}
