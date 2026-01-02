'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@affiliate/utils'

export interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  className?: string
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalItems / pageSize)

  // Calculate the range of items being shown
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', newPageSize.toString())
    params.set('page', '1') // Reset to first page when changing page size
    router.push(`${pathname}?${params.toString()}`)
  }

  if (totalItems === 0) {
    return null
  }

  const pageNumbers = getPageNumbers()
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm text-gray-500',
        className
      )}
    >
      {/* Items count */}
      <div className="flex items-center gap-4">
        <span>
          Showing {startItem}-{endItem} of {totalItems} items
        </span>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-gray-500">
            Show:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="h-8 px-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={!hasPrevious}
          className={cn(
            'flex items-center justify-center h-8 px-2 rounded-md border transition-colors',
            hasPrevious
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed bg-gray-50'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-8 h-8 text-gray-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              )
            }

            const isActive = page === currentPage
            return (
              <button
                key={page}
                onClick={() => navigateToPage(page)}
                className={cn(
                  'flex items-center justify-center min-w-8 h-8 px-2 rounded-md border transition-colors',
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={!hasNext}
          className={cn(
            'flex items-center justify-center h-8 px-2 rounded-md border transition-colors',
            hasNext
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed bg-gray-50'
          )}
          aria-label="Next page"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
