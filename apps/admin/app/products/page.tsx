import { prisma } from '@affiliate/database'

async function getProducts() {
  return prisma.product.findMany({
    include: {
      site: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">
          Manage all products across your sites
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Site</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Rating</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{product.title}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{product.site.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {product.rating ? `${product.rating}/10` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No products found. Add products to your sites to see them here.
          </div>
        )}
      </div>
    </div>
  )
}
