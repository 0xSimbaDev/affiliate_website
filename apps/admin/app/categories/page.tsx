import { prisma } from '@affiliate/database'

async function getCategories() {
  return prisma.category.findMany({
    include: {
      site: {
        select: {
          name: true,
        },
      },
      parent: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
    orderBy: [
      { site: { name: 'asc' } },
      { name: 'asc' },
    ],
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Manage all categories across your sites
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Site</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Parent</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Products</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Subcategories</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{category.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{category.site.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {category.parent?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{category._count.products}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{category._count.children}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No categories found. Create categories for your sites to see them here.
          </div>
        )}
      </div>
    </div>
  )
}
