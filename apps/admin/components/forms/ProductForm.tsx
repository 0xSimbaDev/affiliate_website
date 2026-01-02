'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, ExternalLink } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { generateSlug } from '@/lib/utils'

// Form validation schema
const affiliateLinkSchema = z.object({
  partner: z.string().min(1, 'Partner is required'),
  url: z.string().url('Must be a valid URL'),
  label: z.string().optional(),
})

const productFormSchema = z.object({
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
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  featuredImage: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),

  // Pricing & Affiliates tab
  priceFrom: z.coerce.number().min(0).optional().nullable(),
  priceTo: z.coerce.number().min(0).optional().nullable(),
  priceCurrency: z.string().default('USD'),
  priceText: z.string().max(100).optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().min(0).optional().nullable(),
  affiliateLinks: z.array(affiliateLinkSchema).optional().default([]),
  primaryAffiliateUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),

  // SEO tab
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters').optional().nullable(),
  seoDescription: z
    .string()
    .max(160, 'SEO description should be under 160 characters')
    .optional()
    .nullable(),
  seoKeywords: z.array(z.string()).optional().default([]),

  // Settings tab
  productType: z.string().min(1, 'Product type is required'),
  categoryIds: z.array(z.string()).optional().default([]),
  primaryCategoryId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

export type ProductFormData = z.infer<typeof productFormSchema>

interface Category {
  id: string
  name: string
  categoryType: string
  parentId: string | null
}

interface ProductType {
  slug: string
  label: string
  labelPlural?: string
  icon?: string
}

interface ProductFormProps {
  siteId: string
  siteName: string
  productTypes: ProductType[]
  categories: Category[]
  defaultValues?: Partial<ProductFormData>
  productId?: string
  onSubmit: (data: ProductFormData) => Promise<{ success: boolean; error?: string }>
}

export function ProductForm({
  siteId,
  siteName,
  productTypes,
  categories,
  defaultValues,
  productId,
  onSubmit,
}: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('content')
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('')

  const isEditing = !!productId

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      description: '',
      content: '',
      featuredImage: '',
      priceFrom: null,
      priceTo: null,
      priceCurrency: 'USD',
      priceText: '',
      rating: null,
      reviewCount: null,
      affiliateLinks: [],
      primaryAffiliateUrl: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      productType: productTypes[0]?.slug || '',
      categoryIds: [],
      primaryCategoryId: null,
      status: 'DRAFT',
      isFeatured: false,
      isActive: true,
      sortOrder: 0,
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
  const watchAffiliateLinks = watch('affiliateLinks') || []
  const watchSeoKeywords = watch('seoKeywords') || []
  const watchCategoryIds = watch('categoryIds') || []

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && watchTitle && !watchSlug) {
      setValue('slug', generateSlug(watchTitle))
    }
  }, [watchTitle, watchSlug, isEditing, setValue])

  const handleFormSubmit = (data: ProductFormData) => {
    startTransition(async () => {
      try {
        const result = await onSubmit(data)
        if (result.success) {
          toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully')
          router.push(`/sites/${siteId}/products`)
          router.refresh()
        } else {
          toast.error(result.error || 'Something went wrong')
        }
      } catch (error) {
        toast.error('Failed to save product')
      }
    })
  }

  // Affiliate links management
  const addAffiliateLink = () => {
    setValue('affiliateLinks', [
      ...watchAffiliateLinks,
      { partner: '', url: '', label: '' },
    ])
  }

  const removeAffiliateLink = (index: number) => {
    setValue(
      'affiliateLinks',
      watchAffiliateLinks.filter((_, i) => i !== index)
    )
  }

  const updateAffiliateLink = (
    index: number,
    field: keyof z.infer<typeof affiliateLinkSchema>,
    value: string
  ) => {
    const updated = watchAffiliateLinks.map((link, i) => {
      if (i === index) {
        return {
          partner: link.partner,
          url: link.url,
          label: link.label,
          [field]: value,
        }
      }
      return link
    })
    setValue('affiliateLinks', updated)
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

  // Category management
  const toggleCategory = (categoryId: string) => {
    if (watchCategoryIds.includes(categoryId)) {
      setValue(
        'categoryIds',
        watchCategoryIds.filter((id) => id !== categoryId)
      )
      // Clear primary if removed
      if (form.watch('primaryCategoryId') === categoryId) {
        setValue('primaryCategoryId', null)
      }
    } else {
      setValue('categoryIds', [...watchCategoryIds, categoryId])
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Affiliates</TabsTrigger>
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
                  placeholder="Enter product title"
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
                    placeholder="product-url-slug"
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
                  placeholder="Brief description of the product"
                  rows={3}
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed product description"
                  rows={6}
                />
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
                  <p className="text-sm text-red-500">
                    {errors.featuredImage.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Pricing & Affiliates Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h3 className="font-medium text-gray-900">Pricing</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Price From */}
              <div className="space-y-2">
                <Label htmlFor="priceFrom">Price From</Label>
                <Input
                  id="priceFrom"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('priceFrom')}
                  placeholder="0.00"
                />
              </div>

              {/* Price To */}
              <div className="space-y-2">
                <Label htmlFor="priceTo">Price To</Label>
                <Input
                  id="priceTo"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('priceTo')}
                  placeholder="0.00"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="priceCurrency">Currency</Label>
                <Select
                  value={watch('priceCurrency')}
                  onValueChange={(value) => setValue('priceCurrency', value)}
                >
                  <SelectTrigger id="priceCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Text */}
              <div className="space-y-2">
                <Label htmlFor="priceText">Price Display Text</Label>
                <Input
                  id="priceText"
                  {...register('priceText')}
                  placeholder="From $99/month"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
              {/* Rating */}
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('rating')}
                  placeholder="4.5"
                />
              </div>

              {/* Review Count */}
              <div className="space-y-2">
                <Label htmlFor="reviewCount">Review Count</Label>
                <Input
                  id="reviewCount"
                  type="number"
                  min="0"
                  {...register('reviewCount')}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Affiliate Links</h3>
              <button
                type="button"
                onClick={addAffiliateLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary-50 rounded-md"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {/* Primary Affiliate URL */}
            <div className="space-y-2">
              <Label htmlFor="primaryAffiliateUrl">Primary Affiliate URL</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryAffiliateUrl"
                  {...register('primaryAffiliateUrl')}
                  placeholder="https://affiliate.example.com/product"
                  className="flex-1"
                />
                {watch('primaryAffiliateUrl') && (
                  <a
                    href={watch('primaryAffiliateUrl') || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 border rounded-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {errors.primaryAffiliateUrl && (
                <p className="text-sm text-red-500">
                  {errors.primaryAffiliateUrl.message}
                </p>
              )}
            </div>

            {/* Affiliate Links List */}
            {watchAffiliateLinks.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                {watchAffiliateLinks.map((link, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr,2fr,1fr,auto] gap-3 items-start"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs">Partner</Label>
                      <Input
                        value={link.partner}
                        onChange={(e) =>
                          updateAffiliateLink(index, 'partner', e.target.value)
                        }
                        placeholder="Amazon"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateAffiliateLink(index, 'url', e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={link.label || ''}
                        onChange={(e) =>
                          updateAffiliateLink(index, 'label', e.target.value)
                        }
                        placeholder="Buy Now"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAffiliateLink(index)}
                      className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
                <span>Leave empty to use product title</span>
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
                <span>Leave empty to use product excerpt</span>
                <span>{(watch('seoDescription') || '').length}/160</span>
              </div>
              {errors.seoDescription && (
                <p className="text-sm text-red-500">
                  {errors.seoDescription.message}
                </p>
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
                  {watch('seoTitle') || watch('title') || 'Product Title'}
                </div>
                <div className="text-green-700 text-sm">
                  {siteName.toLowerCase().replace(/\s+/g, '')}.com/products/
                  {watch('slug') || 'product-slug'}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {watch('seoDescription') ||
                    watch('excerpt') ||
                    'Product description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType" required>
                Product Type
              </Label>
              <Select
                value={watch('productType')}
                onValueChange={(value) => setValue('productType', value)}
              >
                <SelectTrigger id="productType">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.slug} value={type.slug}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productType && (
                <p className="text-sm text-red-500">
                  {errors.productType.message}
                </p>
              )}
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

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                {...register('sortOrder')}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isFeatured">Featured Product</Label>
                  <p className="text-xs text-gray-500">
                    Show this product in featured sections
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={watch('isFeatured')}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-gray-500">
                    Inactive products are hidden from the site
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h3 className="font-medium text-gray-900">Categories</h3>

            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">
                No categories available. Create categories first.
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={watchCategoryIds.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="font-normal cursor-pointer"
                      >
                        {category.name}
                        <span className="text-xs text-gray-400 ml-2">
                          ({category.categoryType})
                        </span>
                      </Label>
                    </div>
                    {watchCategoryIds.includes(category.id) && (
                      <button
                        type="button"
                        onClick={() => setValue('primaryCategoryId', category.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          watch('primaryCategoryId') === category.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {watch('primaryCategoryId') === category.id
                          ? 'Primary'
                          : 'Set as Primary'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
