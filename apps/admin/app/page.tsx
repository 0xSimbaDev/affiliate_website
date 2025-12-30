import { prisma } from '@affiliate/database'

async function getStats() {
  const [sitesCount, productsCount, articlesCount, categoriesCount] = await Promise.all([
    prisma.site.count(),
    prisma.product.count(),
    prisma.article.count(),
    prisma.category.count(),
  ])

  return {
    sites: sitesCount,
    products: productsCount,
    articles: articlesCount,
    categories: categoriesCount,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Sites', value: stats.sites, href: '/sites' },
    { label: 'Total Products', value: stats.products, href: '/products' },
    { label: 'Total Articles', value: stats.articles, href: '/articles' },
    { label: 'Total Categories', value: stats.categories, href: '/categories' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your affiliate platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="block p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
          </a>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/sites"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Manage Sites
          </a>
          <a
            href="/products"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            View Products
          </a>
          <a
            href="/articles"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            View Articles
          </a>
        </div>
      </div>
    </div>
  )
}
