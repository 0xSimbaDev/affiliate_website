import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@affiliate/database'
import { ArticleForm, type ArticleFormData } from '@/components/forms/ArticleForm'
import { createArticle } from '../actions'

async function getSite(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      name: true,
    },
  })

  return site
}

async function getArticleCategories(siteId: string) {
  const categories = await prisma.articleCategory.findMany({
    where: { siteId, isActive: true },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return categories
}

export default async function NewArticlePage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const [site, articleCategories] = await Promise.all([
    getSite(siteId),
    getArticleCategories(siteId),
  ])

  if (!site) {
    notFound()
  }

  async function handleSubmit(data: ArticleFormData) {
    'use server'
    return createArticle(siteId, data)
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/sites/${siteId}/articles`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Article</h1>
        <p className="text-gray-500 mt-1">
          Create a new article for {site.name}
        </p>
      </div>

      {/* Form */}
      <ArticleForm
        siteId={siteId}
        siteName={site.name}
        articleCategories={articleCategories}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
