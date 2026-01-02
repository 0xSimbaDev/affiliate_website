'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface ArticleFiltersProps {
  siteId: string
  articleCategories: { id: string; name: string }[]
  currentFilters: {
    status?: string
    type?: string
    categoryId?: string
    search?: string
  }
}

const ARTICLE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'ROUNDUP', label: 'Roundup' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'COMPARISON', label: 'Comparison' },
  { value: 'BUYING_GUIDE', label: 'Buying Guide' },
  { value: 'HOW_TO', label: 'How To' },
]

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export function ArticleFilters({
  siteId,
  articleCategories,
  currentFilters,
}: ArticleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentFilters.search || '')
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset pagination when filters change
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = useCallback((name: string, value: string) => {
    startTransition(() => {
      const queryString = createQueryString(name, value)
      router.push(`/sites/${siteId}/articles${queryString ? `?${queryString}` : ''}`)
    })
  }, [createQueryString, router, siteId])

  // Debounced search effect
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Don't trigger on initial render if search matches current filter
    if (searchValue === (currentFilters.search || '')) {
      return
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      handleFilterChange('search', searchValue)
    }, 300)

    // Cleanup timeout on unmount or value change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchValue, handleFilterChange, currentFilters.search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Clear debounce timeout and trigger immediately on form submit
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    handleFilterChange('search', searchValue)
  }

  const clearSearch = () => {
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    setSearchValue('')
    handleFilterChange('search', '')
  }

  const hasFilters =
    currentFilters.status ||
    currentFilters.type ||
    currentFilters.categoryId ||
    currentFilters.search

  const clearAllFilters = () => {
    setSearchValue('')
    startTransition(() => {
      router.push(`/sites/${siteId}/articles`)
    })
  }

  return (
    <div className="bg-white rounded-lg border mb-4">
      <div className="p-4 flex items-center gap-4 flex-wrap">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-10 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Status Filter */}
        <select
          value={currentFilters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          disabled={isPending}
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={currentFilters.type || 'all'}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          disabled={isPending}
        >
          {ARTICLE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        {articleCategories.length > 0 && (
          <select
            value={currentFilters.categoryId || 'all'}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            disabled={isPending}
          >
            <option value="all">All Categories</option>
            {articleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-10 px-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
            disabled={isPending}
          >
            Clear filters
          </button>
        )}

        {isPending && (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  )
}
