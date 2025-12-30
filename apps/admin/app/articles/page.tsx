import { prisma } from '@affiliate/database'

async function getArticles() {
  return prisma.article.findMany({
    include: {
      site: {
        select: {
          name: true,
        },
      },
      author: {
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

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Articles</h1>
        <p className="text-muted-foreground mt-1">
          Manage all articles across your sites
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Site</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Author</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{article.title}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{article.site.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {article.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {article.author?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      article.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : article.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No articles found. Create articles for your sites to see them here.
          </div>
        )}
      </div>
    </div>
  )
}
