'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { Package, Grid, GitCompare, Search, X, Check } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@affiliate/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  buildShortcodeValue,
  getShortcodeLabel,
  type ShortcodeType,
} from './extensions/shortcode'

interface ShortcodeInserterProps {
  editor: Editor
  siteId?: string
}

interface Product {
  id: string
  slug: string
  title: string
}

interface Category {
  id: string
  slug: string
  name: string
}

export function ShortcodeInserter({ editor, siteId }: ShortcodeInserterProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ShortcodeType>('product')

  // Single product state
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productVariant, setProductVariant] = useState<string>('default')
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Products grid state
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [productsLimit, setProductsLimit] = useState<number>(3)
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Comparison state
  const [comparisonSearch, setComparisonSearch] = useState('')
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([])
  const [selectedComparisonProducts, setSelectedComparisonProducts] = useState<
    Product[]
  >([])
  const [loadingComparisonProducts, setLoadingComparisonProducts] = useState(false)

  // Fetch products for search
  const searchProducts = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setProducts([])
        return
      }

      setLoadingProducts(true)
      try {
        const params = new URLSearchParams({ q: query })
        if (siteId) params.append('siteId', siteId)
        const response = await fetch(`/api/products/search?${params}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Failed to search products:', error)
      } finally {
        setLoadingProducts(false)
      }
    },
    [siteId]
  )

  // Fetch products for comparison search
  const searchComparisonProducts = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setComparisonProducts([])
        return
      }

      setLoadingComparisonProducts(true)
      try {
        const params = new URLSearchParams({ q: query })
        if (siteId) params.append('siteId', siteId)
        const response = await fetch(`/api/products/search?${params}`)
        if (response.ok) {
          const data = await response.json()
          setComparisonProducts(data.products || [])
        }
      } catch (error) {
        console.error('Failed to search products:', error)
      } finally {
        setLoadingComparisonProducts(false)
      }
    },
    [siteId]
  )

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      const params = new URLSearchParams()
      if (siteId) params.append('siteId', siteId)
      const response = await fetch(`/api/categories?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }, [siteId])

  // Debounced product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'product') {
        searchProducts(productSearch)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch, activeTab, searchProducts])

  // Debounced comparison product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'comparison') {
        searchComparisonProducts(comparisonSearch)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [comparisonSearch, activeTab, searchComparisonProducts])

  // Fetch categories when products tab is opened
  useEffect(() => {
    if (activeTab === 'products' && categories.length === 0) {
      fetchCategories()
    }
  }, [activeTab, categories.length, fetchCategories])

  // Reset state when popover closes
  useEffect(() => {
    if (!open) {
      setProductSearch('')
      setProducts([])
      setSelectedProduct(null)
      setProductVariant('default')
      setSelectedCategory(null)
      setProductsLimit(3)
      setComparisonSearch('')
      setComparisonProducts([])
      setSelectedComparisonProducts([])
    }
  }, [open])

  // Insert shortcode into editor
  const insertShortcode = (type: ShortcodeType) => {
    let value: string
    let params: Record<string, string | number | string[]>

    switch (type) {
      case 'product':
        if (!selectedProduct) return
        params = { slug: selectedProduct.slug, variant: productVariant }
        value = buildShortcodeValue('product', params)
        break
      case 'products':
        if (!selectedCategory) return
        params = { categorySlug: selectedCategory.slug, limit: productsLimit }
        value = buildShortcodeValue('products', params)
        break
      case 'comparison':
        if (selectedComparisonProducts.length < 2) return
        params = { slugs: selectedComparisonProducts.map((p) => p.slug) }
        value = buildShortcodeValue('comparison', params)
        break
      default:
        return
    }

    const label = getShortcodeLabel(type, params)

    editor.commands.insertShortcode({
      type,
      value,
      label,
    })

    setOpen(false)
  }

  // Toggle product in comparison selection
  const toggleComparisonProduct = (product: Product) => {
    setSelectedComparisonProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id)
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id)
      }
      if (prev.length >= 4) {
        return prev // Max 4 products
      }
      return [...prev, product]
    })
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          title="Insert Shortcode"
          className={cn(
            'flex h-8 items-center gap-1.5 rounded px-2 transition-colors',
            'hover:bg-gray-100 text-gray-700',
            open && 'bg-primary/10 text-primary'
          )}
        >
          <Package className="h-4 w-4" />
          <span className="text-sm">Shortcode</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[400px] rounded-lg border bg-white p-4 shadow-lg animate-scaleIn"
          sideOffset={8}
          align="start"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Insert Shortcode</h3>
            <Popover.Close className="rounded p-1 hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-500" />
            </Popover.Close>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ShortcodeType)}
          >
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="product" className="flex-1 gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Product
              </TabsTrigger>
              <TabsTrigger value="products" className="flex-1 gap-1.5">
                <Grid className="h-3.5 w-3.5" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex-1 gap-1.5">
                <GitCompare className="h-3.5 w-3.5" />
                Compare
              </TabsTrigger>
            </TabsList>

            {/* Single Product Tab */}
            <TabsContent value="product" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Product
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by title or slug..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Product Search Results */}
              {products.length > 0 && (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product)
                        setProductSearch('')
                        setProducts([])
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                        'hover:bg-gray-100'
                      )}
                    >
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      <span className="flex-1 truncate">{product.title}</span>
                      <span className="text-xs text-gray-400">
                        {product.slug}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {loadingProducts && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Searching...
                </div>
              )}

              {/* Selected Product */}
              {selectedProduct && (
                <div className="rounded-md border bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {selectedProduct.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="rounded p-0.5 hover:bg-gray-200"
                    >
                      <X className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Slug: {selectedProduct.slug}
                  </div>
                </div>
              )}

              {/* Variant Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Display Variant
                </label>
                <Select value={productVariant} onValueChange={setProductVariant}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedProduct && (
                <div className="rounded-md bg-gray-100 p-2 text-sm font-mono">
                  [
                  {buildShortcodeValue('product', {
                    slug: selectedProduct.slug,
                    variant: productVariant,
                  })}
                  ]
                </div>
              )}

              <button
                type="button"
                disabled={!selectedProduct}
                onClick={() => insertShortcode('product')}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
                  selectedProduct
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                Insert Product
              </button>
            </TabsContent>

            {/* Products Grid Tab */}
            <TabsContent value="products" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                {loadingCategories ? (
                  <div className="py-2 text-center text-sm text-gray-500">
                    Loading categories...
                  </div>
                ) : (
                  <Select
                    value={selectedCategory?.slug || ''}
                    onValueChange={(slug) => {
                      const category = categories.find((c) => c.slug === slug)
                      setSelectedCategory(category || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Number of Products
                </label>
                <Select
                  value={productsLimit.toString()}
                  onValueChange={(v) => setProductsLimit(parseInt(v, 10))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 products</SelectItem>
                    <SelectItem value="3">3 products</SelectItem>
                    <SelectItem value="4">4 products</SelectItem>
                    <SelectItem value="6">6 products</SelectItem>
                    <SelectItem value="8">8 products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedCategory && (
                <div className="rounded-md bg-gray-100 p-2 text-sm font-mono">
                  [
                  {buildShortcodeValue('products', {
                    categorySlug: selectedCategory.slug,
                    limit: productsLimit,
                  })}
                  ]
                </div>
              )}

              <button
                type="button"
                disabled={!selectedCategory}
                onClick={() => insertShortcode('products')}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
                  selectedCategory
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                Insert Product Grid
              </button>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Products (select 2-4)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by title or slug..."
                    value={comparisonSearch}
                    onChange={(e) => setComparisonSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Comparison Product Search Results */}
              {comparisonProducts.length > 0 && (
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
                  {comparisonProducts.map((product) => {
                    const isSelected = selectedComparisonProducts.some(
                      (p) => p.id === product.id
                    )
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleComparisonProduct(product)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                          isSelected ? 'bg-primary/10' : 'hover:bg-gray-100'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border',
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="flex-1 truncate">{product.title}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {loadingComparisonProducts && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Searching...
                </div>
              )}

              {/* Selected Products */}
              {selectedComparisonProducts.length > 0 && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Selected Products ({selectedComparisonProducts.length}/4)
                  </label>
                  <div className="rounded-md border p-2">
                    {selectedComparisonProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm">
                          {index + 1}. {product.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleComparisonProduct(product)}
                          className="rounded p-0.5 hover:bg-gray-100"
                        >
                          <X className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {selectedComparisonProducts.length >= 2 && (
                <div className="rounded-md bg-gray-100 p-2 text-sm font-mono">
                  [
                  {buildShortcodeValue('comparison', {
                    slugs: selectedComparisonProducts.map((p) => p.slug),
                  })}
                  ]
                </div>
              )}

              <button
                type="button"
                disabled={selectedComparisonProducts.length < 2}
                onClick={() => insertShortcode('comparison')}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
                  selectedComparisonProducts.length >= 2
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                Insert Comparison
              </button>
            </TabsContent>
          </Tabs>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default ShortcodeInserter
