'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Trash2, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { MediaGrid } from '@/components/media/MediaGrid'
import { MediaUploader } from '@/components/media/MediaUploader'
import { MediaDetailModal } from '@/components/media/MediaDetailModal'
import {
  getMedia,
  deleteMultipleMedia,
  type MediaItem,
  type MediaQueryOptions,
} from './actions'

interface MediaLibraryClientProps {
  siteId: string
}

type MediaTypeFilter = 'all' | 'images' | 'documents'

export function MediaLibraryClient({ siteId }: MediaLibraryClientProps) {
  // State
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  // Modal
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [showUploader, setShowUploader] = useState(false)

  // Load media
  const loadMedia = useCallback(async (options: Partial<MediaQueryOptions> = {}) => {
    setLoading(true)
    try {
      const result = await getMedia(siteId, {
        search: options.search ?? search,
        type: options.type ?? typeFilter,
        page: options.page ?? page,
        limit: 24,
      })
      setMedia(result.media)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setPage(result.page)
    } catch (error) {
      console.error('Failed to load media:', error)
      toast.error('Failed to load media')
    }
    setLoading(false)
  }, [siteId, search, typeFilter, page])

  // Initial load
  useEffect(() => {
    loadMedia()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadMedia({ page: 1 })
  }

  // Handle filter change
  const handleFilterChange = (type: MediaTypeFilter) => {
    setTypeFilter(type)
    loadMedia({ type, page: 1 })
  }

  // Handle selection
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([])
    setSelectionMode(false)
  }

  // Delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return

    const confirmMessage = selectedIds.length === 1
      ? 'Are you sure you want to delete this file?'
      : `Are you sure you want to delete ${selectedIds.length} files?`

    if (!confirm(confirmMessage)) return

    const result = await deleteMultipleMedia(siteId, selectedIds)

    if (result.success) {
      toast.success(`Deleted ${result.deleted} file${result.deleted !== 1 ? 's' : ''}`)
      clearSelection()
      loadMedia()
    } else {
      toast.error(result.error || 'Failed to delete files')
    }
  }

  // Handle item click
  const handleItemClick = (item: MediaItem) => {
    setSelectedMedia(item)
  }

  // Handle upload complete
  const handleUploadComplete = () => {
    loadMedia({ page: 1 })
    setShowUploader(false)
  }

  // Handle media delete from modal
  const handleMediaDeleted = () => {
    loadMedia()
  }

  // Pagination
  const handlePrevPage = () => {
    if (page > 1) {
      loadMedia({ page: page - 1 })
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      loadMedia({ page: page + 1 })
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename..."
                className="pl-10"
              />
            </div>
          </form>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => handleFilterChange(e.target.value as MediaTypeFilter)}
              className="h-11 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
            </select>
          </div>

          {/* Upload button */}
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Upload area (collapsible) */}
        {showUploader && (
          <div className="mt-4 pt-4 border-t">
            <MediaUploader
              siteId={siteId}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}
      </div>

      {/* Selection toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              {selectedIds.length} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
          <button
            onClick={handleDeleteSelected}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Media grid */}
      <div className="bg-white rounded-lg border p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <MediaGrid
              media={media}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onItemClick={handleItemClick}
              selectionMode={selectionMode}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {media.length} of {total} files
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      <MediaDetailModal
        media={selectedMedia}
        siteId={siteId}
        open={selectedMedia !== null}
        onClose={() => setSelectedMedia(null)}
        onDelete={handleMediaDeleted}
      />
    </div>
  )
}
