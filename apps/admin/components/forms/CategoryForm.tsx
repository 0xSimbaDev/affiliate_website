'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { generateSlug } from '@/lib/utils'

// Form validation schema
const categoryFormSchema = z.object({
  // Content tab
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  categoryType: z.string().min(1, 'Category type is required'),
  parentId: z.string().nullable().optional(),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  featuredImage: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),

  // SEO tab
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters').optional().nullable(),
  seoDescription: z
    .string()
    .max(160, 'SEO description should be under 160 characters')
    .optional()
    .nullable(),
  seoKeywords: z.array(z.string()).optional().default([]),

  // Settings tab
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().min(0).default(0),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

interface ParentCategory {
  id: string
  name: string
  categoryType: string
  parentId: string | null
  depth?: number
}

interface CategoryFormProps {
  siteId: string
  siteName: string
  categoryTypes: string[]
  parentCategories: ParentCategory[]
  defaultValues?: Partial<CategoryFormData>
  categoryId?: string
  onSubmit: (data: CategoryFormData) => Promise<{ success: boolean; error?: string }>
}

// Build hierarchical list with indentation
function buildHierarchicalList(
  categories: ParentCategory[],
  excludeId?: string
): ParentCategory[] {
  const categoryMap = new Map<string | null, ParentCategory[]>()

  // Group by parentId
  for (const cat of categories) {
    const parent = cat.parentId ?? null
    if (!categoryMap.has(parent)) {
      categoryMap.set(parent, [])
    }
    categoryMap.get(parent)!.push(cat)
  }

  const result: ParentCategory[] = []

  function addChildren(parentId: string | null, depth: number) {
    const children = categoryMap.get(parentId) || []
    for (const child of children) {
      if (child.id !== excludeId) {
        result.push({ ...child, depth })
        addChildren(child.id, depth + 1)
      }
    }
  }

  addChildren(null, 0)
  return result
}

export function CategoryForm({
  siteId,
  siteName,
  categoryTypes,
  parentCategories,
  defaultValues,
  categoryId,
  onSubmit,
}: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('content')
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('')

  const isEditing = !!categoryId

  // Build hierarchical list excluding current category (to prevent self-reference)
  const hierarchicalCategories = buildHierarchicalList(parentCategories, categoryId)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      categoryType: categoryTypes[0] || '',
      parentId: null,
      description: '',
      featuredImage: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
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

  const watchName = watch('name')
  const watchSlug = watch('slug')
  const watchCategoryType = watch('categoryType')
  const watchSeoKeywords = watch('seoKeywords') || []

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && watchName && !watchSlug) {
      setValue('slug', generateSlug(watchName))
    }
  }, [watchName, watchSlug, isEditing, setValue])

  // Filter parent categories by selected category type
  const availableParentCategories = hierarchicalCategories.filter(
    (cat) => cat.categoryType === watchCategoryType
  )

  const handleFormSubmit = (data: CategoryFormData) => {
    startTransition(async () => {
      try {
        const result = await onSubmit(data)
        if (result.success) {
          toast.success(isEditing ? 'Category updated successfully' : 'Category created successfully')
          router.push(`/sites/${siteId}/categories`)
          router.refresh()
        } else {
          toast.error(result.error || 'Something went wrong')
        }
      } catch (error) {
        toast.error('Failed to save category')
      }
    })
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
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div className="grid gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Name
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
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
                    placeholder="category-url-slug"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('slug', generateSlug(watchName))}
                    className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              {/* Category Type */}
              <div className="space-y-2">
                <Label htmlFor="categoryType" required>
                  Category Type
                </Label>
                <Select
                  value={watch('categoryType')}
                  onValueChange={(value) => {
                    setValue('categoryType', value)
                    // Reset parent when changing type
                    setValue('parentId', null)
                  }}
                >
                  <SelectTrigger id="categoryType">
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryType && (
                  <p className="text-sm text-red-500">
                    {errors.categoryType.message}
                  </p>
                )}
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={watch('parentId') || 'none'}
                  onValueChange={(value) =>
                    setValue('parentId', value === 'none' ? null : value)
                  }
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {availableParentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {'—'.repeat(category.depth || 0)} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Leave empty to create a root category
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of the category"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
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
                  <p className="text-sm text-red-500">
                    {errors.featuredImage.message}
                  </p>
                )}
              </div>
            </div>
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
                <span>Leave empty to use category name</span>
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
                <span>Leave empty to use category description</span>
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
                  {watch('seoTitle') || watch('name') || 'Category Name'}
                </div>
                <div className="text-green-700 text-sm">
                  {siteName.toLowerCase().replace(/\s+/g, '')}.com/categories/
                  {watch('slug') || 'category-slug'}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {watch('seoDescription') ||
                    watch('description') ||
                    'Category description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
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
                Lower numbers appear first. Categories with the same sort order are sorted alphabetically.
              </p>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-gray-500">
                    Inactive categories are hidden from the site
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
          {isEditing ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}
