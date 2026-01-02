'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import {
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { RichEditor } from '@/components/editor/RichEditor'
import { generateSlug } from '@/lib/utils'
import { searchProducts } from '@/app/(dashboard)/sites/[siteId]/articles/actions'

// FAQ item schema
const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
})

// Article product schema
const articleProductSchema = z.object({
  productId: z.string().min(1),
  position: z.number().int().min(0),
  highlight: z.string().optional().nullable(),
})

// Form validation schema
const articleFormSchema = z.object({
  // Content tab
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  excerpt: z.string().max(500, 'Excerpt is too long').optional().nullable(),
  content: z.string().optional().nullable(),
  featuredImage: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  faqs: z.array(faqItemSchema).optional().default([]),

  // Products tab
  products: z.array(articleProductSchema).optional().default([]),

  // SEO tab
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters').optional().nullable(),
  seoDescription: z
    .string()
    .max(160, 'SEO description should be under 160 characters')
    .optional()
    .nullable(),
  seoKeywords: z.array(z.string()).optional().default([]),

  // Settings tab
  articleType: z.enum(['ROUNDUP', 'REVIEW', 'COMPARISON', 'BUYING_GUIDE', 'HOW_TO']).default('ROUNDUP'),
  articleCategoryId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  author: z.string().max(100).optional().nullable(),
})

export type ArticleFormData = z.infer<typeof articleFormSchema>

interface ArticleCategory {
  id: string
  name: string
  parentId: string | null
}

interface ProductData {
  id: string
  title: string
  featuredImage: string | null
  slug: string
}

interface ArticleProduct extends ProductData {
  position: number
  highlight: string | null
}

interface ArticleFormProps {
  siteId: string
  siteName: string
  articleCategories: ArticleCategory[]
  defaultValues?: Partial<ArticleFormData>
  initialProducts?: ArticleProduct[]
  articleId?: string
  onSubmit: (data: ArticleFormData) => Promise<{ success: boolean; error?: string }>
}

const ARTICLE_TYPES = [
  { value: 'ROUNDUP', label: 'Roundup', description: 'Best X of 2025 - links multiple products' },
  { value: 'REVIEW', label: 'Review', description: 'Single product in-depth review' },
  { value: 'COMPARISON', label: 'Comparison', description: 'Product vs Product' },
  { value: 'BUYING_GUIDE', label: 'Buying Guide', description: 'How to choose the right X' },
  { value: 'HOW_TO', label: 'How To', description: 'Tutorial/instructional content' },
] as const

export function ArticleForm({
  siteId,
  siteName,
  articleCategories,
  defaultValues,
  initialProducts = [],
  articleId,
  onSubmit,
}: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('content')
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('')
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set([0]))

  // Product search state
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [productSearchResults, setProductSearchResults] = useState<ProductData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<ArticleProduct[]>(initialProducts)

  const isEditing = !!articleId

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      faqs: [],
      products: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      articleType: 'ROUNDUP',
      articleCategoryId: null,
      status: 'DRAFT',
      isFeatured: false,
      publishedAt: null,
      author: '',
      ...defaultValues,
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const watchTitle = watch('title')
  const watchSlug = watch('slug')
  const watchSeoKeywords = watch('seoKeywords') || []
  const watchFaqs = watch('faqs') || []
  const watchContent = watch('content')

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && watchTitle && !watchSlug) {
      setValue('slug', generateSlug(watchTitle))
    }
  }, [watchTitle, watchSlug, isEditing, setValue])

  // Sync products to form
  useEffect(() => {
    setValue(
      'products',
      selectedProducts.map((p, index) => ({
        productId: p.id,
        position: index,
        highlight: p.highlight,
      }))
    )
  }, [selectedProducts, setValue])

  // Debounced product search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (productSearchQuery.length >= 2) {
        setIsSearching(true)
        try {
          const results = await searchProducts(siteId, productSearchQuery)
          // Filter out already selected products
          const filteredResults = results.filter(
            (r) => !selectedProducts.some((sp) => sp.id === r.id)
          )
          setProductSearchResults(filteredResults)
        } catch (error) {
          console.error('Product search failed:', error)
        }
        setIsSearching(false)
      } else {
        setProductSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [productSearchQuery, siteId, selectedProducts])

  const handleFormSubmit = (data: ArticleFormData) => {
    startTransition(async () => {
      try {
        const result = await onSubmit(data)
        if (result.success) {
          toast.success(isEditing ? 'Article updated successfully' : 'Article created successfully')
          router.push(`/sites/${siteId}/articles`)
          router.refresh()
        } else {
          toast.error(result.error || 'Something went wrong')
        }
      } catch (error) {
        toast.error('Failed to save article')
      }
    })
  }

  // FAQ management
  const addFaq = () => {
    const newFaqs = [...watchFaqs, { question: '', answer: '' }]
    setValue('faqs', newFaqs)
    setExpandedFaqs((prev) => new Set([...prev, newFaqs.length - 1]))
  }

  const removeFaq = (index: number) => {
    setValue(
      'faqs',
      watchFaqs.filter((_, i) => i !== index)
    )
    setExpandedFaqs((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = watchFaqs.map((faq, i) => {
      if (i === index) {
        return { ...faq, [field]: value }
      }
      return faq
    })
    setValue('faqs', updated)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Product management
  const addProduct = (product: ProductData) => {
    setSelectedProducts((prev) => [
      ...prev,
      { ...product, position: prev.length, highlight: null },
    ])
    setProductSearchQuery('')
    setProductSearchResults([])
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const updateProductHighlight = (productId: string, highlight: string) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, highlight: highlight || null } : p))
    )
  }

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= selectedProducts.length) return

    const newProducts = [...selectedProducts]
    const removed = newProducts.splice(index, 1)[0]
    if (removed) {
      newProducts.splice(newIndex, 0, removed)
      setSelectedProducts(newProducts)
    }
  }

  // SEO keywords management
  const addSeoKeyword = () => {
    if (seoKeywordsInput.trim()) {
      const keywords = seoKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k && !watchSeoKeywords.includes(k))
      setValue('seoKeywords', [...watchSeoKeywords, ...keywords])
      setSeoKeywordsInput('')
    }
  }

  const removeSeoKeyword = (keyword: string) => {
    setValue(
      'seoKeywords',
      watchSeoKeywords.filter((k) => k !== keyword)
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="products">
            Products
            {selectedProducts.length > 0 && (
              <span className="ml-2 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded">
                {selectedProducts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div className="grid gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" required>
                  Title
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter article title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" required>
                  Slug
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="article-url-slug"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('slug', generateSlug(watchTitle))}
                    className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register('excerpt')}
                  placeholder="Brief description of the article"
                  rows={3}
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  {...register('featuredImage')}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.featuredImage && (
                  <p className="text-sm text-red-500">{errors.featuredImage.message}</p>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label>Content</Label>
                <RichEditor
                  content={watchContent || ''}
                  onChange={(html) => setValue('content', html)}
                  placeholder="Write your article content..."
                  siteId={siteId}
                  minHeight="400px"
                />
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">FAQs</h3>
                <p className="text-sm text-gray-500">
                  Add frequently asked questions for this article
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-md"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>

            {watchFaqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {watchFaqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-400">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-900 truncate">
                          {faq.question || 'New Question'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFaq(index)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedFaqs.has(index) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {expandedFaqs.has(index) && (
                      <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
                        <div className="space-y-2 pt-4">
                          <Label>Question</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            placeholder="Enter the question"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            placeholder="Enter the answer"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">Related Products</h3>
              <p className="text-sm text-gray-500">
                Add products to feature in this article
              </p>
            </div>

            {/* Product Search */}
            <div className="space-y-2">
              <Label>Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search by product title or slug..."
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {productSearchResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                  {productSearchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                    >
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          width={40}
                          height={30}
                          className="w-10 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500">/{product.slug}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Products */}
            {selectedProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                <p>No products added yet.</p>
                <p className="text-sm">Search and add products above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label>
                  Selected Products ({selectedProducts.length})
                </Label>
                <div className="space-y-2">
                  {selectedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50"
                    >
                      {/* Reorder Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveProduct(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <button
                          type="button"
                          onClick={() => moveProduct(index, 'down')}
                          disabled={index === selectedProducts.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Position Number */}
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-medium rounded-full text-sm">
                        {index + 1}
                      </div>

                      {/* Product Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.title}
                            width={64}
                            height={48}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="font-medium text-gray-900 truncate">
                            {product.title}
                          </p>
                          <Input
                            value={product.highlight || ''}
                            onChange={(e) =>
                              updateProductHighlight(product.id, e.target.value)
                            }
                            placeholder="Highlight text (e.g., 'Best Overall')"
                            className="text-sm h-9"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                {...register('seoTitle')}
                placeholder="SEO optimized title (max 70 characters)"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Leave empty to use article title</span>
                <span>{(watch('seoTitle') || '').length}/70</span>
              </div>
              {errors.seoTitle && (
                <p className="text-sm text-red-500">{errors.seoTitle.message}</p>
              )}
            </div>

            {/* SEO Description */}
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                {...register('seoDescription')}
                placeholder="Meta description for search engines (max 160 characters)"
                rows={3}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Leave empty to use article excerpt</span>
                <span>{(watch('seoDescription') || '').length}/160</span>
              </div>
              {errors.seoDescription && (
                <p className="text-sm text-red-500">{errors.seoDescription.message}</p>
              )}
            </div>

            {/* SEO Keywords */}
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="seoKeywords"
                  value={seoKeywordsInput}
                  onChange={(e) => setSeoKeywordsInput(e.target.value)}
                  placeholder="Add keywords (comma-separated)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSeoKeyword()
                    }
                  }}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={addSeoKeyword}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
              {watchSeoKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {watchSeoKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeSeoKeyword(keyword)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* SEO Preview */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Search Preview
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {watch('seoTitle') || watch('title') || 'Article Title'}
                </div>
                <div className="text-green-700 text-sm">
                  {siteName.toLowerCase().replace(/\s+/g, '')}.com/articles/
                  {watch('slug') || 'article-slug'}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {watch('seoDescription') ||
                    watch('excerpt') ||
                    'Article description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            {/* Article Type */}
            <div className="space-y-2">
              <Label htmlFor="articleType" required>
                Article Type
              </Label>
              <Select
                value={watch('articleType')}
                onValueChange={(value) =>
                  setValue('articleType', value as ArticleFormData['articleType'])
                }
              >
                <SelectTrigger id="articleType">
                  <SelectValue placeholder="Select article type" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Article Category */}
            <div className="space-y-2">
              <Label htmlFor="articleCategoryId">Article Category</Label>
              <Select
                value={watch('articleCategoryId') || 'none'}
                onValueChange={(value) =>
                  setValue('articleCategoryId', value === 'none' ? null : value)
                }
              >
                <SelectTrigger id="articleCategoryId">
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {articleCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) =>
                  setValue('status', value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Published At */}
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish Date</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                {...register('publishedAt')}
              />
              <p className="text-xs text-gray-500">
                Leave empty to publish immediately when status is set to Published
              </p>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                {...register('author')}
                placeholder="Author name"
              />
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isFeatured">Featured Article</Label>
                  <p className="text-xs text-gray-500">
                    Show this article in featured sections
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={watch('isFeatured')}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  )
}
