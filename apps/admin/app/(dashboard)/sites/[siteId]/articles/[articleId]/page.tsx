import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { prisma } from '@affiliate/database'
import { ArticleForm, type ArticleFormData } from '@/components/forms/ArticleForm'
import { updateArticle, deleteArticle, duplicateArticle } from '../actions'
import { DeleteArticleButton } from './DeleteArticleButton'
import { DuplicateArticleButton } from './DuplicateArticleButton'

async function getSite(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      name: true,
      domain: true,
      contentSlug: true,
    },
  })

  return site
}

async function getArticle(siteId: string, articleId: string) {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      siteId,
    },
    include: {
      articleCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      products: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              featuredImage: true,
              slug: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  })

  return article
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

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ siteId: string; articleId: string }>
}) {
  const { siteId, articleId } = await params
  const [site, article, articleCategories] = await Promise.all([
    getSite(siteId),
    getArticle(siteId, articleId),
    getArticleCategories(siteId),
  ])

  if (!site || !article) {
    notFound()
  }

  // Transform article data to form defaults
  const defaultValues: Partial<ArticleFormData> = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    featuredImage: article.featuredImage,
    faqs: (article.faqs as Array<{ question: string; answer: string }>) || [],
    products: article.products.map((ap) => ({
      productId: ap.productId,
      position: ap.position,
      highlight: ap.highlight,
    })),
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    seoKeywords: article.seoKeywords,
    articleType: article.articleType,
    articleCategoryId: article.articleCategoryId,
    status: article.status,
    isFeatured: article.isFeatured,
    publishedAt: article.publishedAt
      ? new Date(article.publishedAt).toISOString().slice(0, 16)
      : null,
    author: article.author,
  }

  // Transform products for the form
  const initialProducts = article.products.map((ap) => ({
    id: ap.product.id,
    title: ap.product.title,
    featuredImage: ap.product.featuredImage,
    slug: ap.product.slug,
    position: ap.position,
    highlight: ap.highlight,
  }))

  async function handleSubmit(data: ArticleFormData) {
    'use server'
    return updateArticle(siteId, articleId, data)
  }

  async function handleDelete() {
    'use server'
    return deleteArticle(siteId, articleId)
  }

  async function handleDuplicate() {
    'use server'
    return duplicateArticle(siteId, articleId)
  }

  // Build the public article URL
  const publicUrl = `https://${site.domain}/${site.contentSlug}/${article.slug}`

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
            <div className="flex items-center gap-3 mt-1">
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
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                {article.articleType.replace('_', ' ')}
              </span>
              {article.status === 'PUBLISHED' && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View on site
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DuplicateArticleButton onDuplicate={handleDuplicate} siteId={siteId} />
            <DeleteArticleButton
              onDelete={handleDelete}
              articleTitle={article.title}
              siteId={siteId}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <ArticleForm
        siteId={siteId}
        siteName={site.name}
        articleCategories={articleCategories}
        defaultValues={defaultValues}
        initialProducts={initialProducts}
        articleId={articleId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
