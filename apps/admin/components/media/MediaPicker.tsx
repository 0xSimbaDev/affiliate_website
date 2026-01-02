'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Search, Upload, Check, ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MediaUploader } from './MediaUploader'
import { getMedia } from '@/app/(dashboard)/sites/[siteId]/media/actions'
import type { MediaItem, MediaQueryOptions } from '@/app/(dashboard)/sites/[siteId]/media/actions'

interface MediaPickerProps {
  siteId: string
  value?: string
  onChange: (url: string) => void
  label?: string
  className?: string
}

export function MediaPicker({
  siteId,
  value,
  onChange,
  label = 'Select Image',
  className = '',
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  // Load media from server
  const loadMedia = useCallback(async (options: MediaQueryOptions = {}) => {
    setLoading(true)
    try {
      const result = await getMedia(siteId, {
        type: 'images',
        page: options.page || 1,
        search: options.search || undefined,
        limit: 18,
      })
      setMedia(result.media)
      setTotalPages(result.totalPages)
      setPage(result.page)
    } catch (error) {
      console.error('Failed to load media:', error)
    }
    setLoading(false)
  }, [siteId])

  // Load media when dialog opens
  useEffect(() => {
    if (open) {
      loadMedia()
    }
  }, [open, loadMedia])

  // Handle search
  const handleSearch = () => {
    loadMedia({ search, page: 1 })
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    loadMedia({ search, page: newPage })
  }

  // Handle selection
  const handleSelect = () => {
    if (selectedUrl) {
      onChange(selectedUrl)
      setOpen(false)
      setSelectedUrl(null)
    }
  }

  // Handle upload complete
  const handleUploadComplete = () => {
    setActiveTab('library')
    loadMedia()
  }

  // Clear selection
  const handleClear = () => {
    onChange('')
  }

  return (
    <>
      {/* Trigger button/preview */}
      <div className={`space-y-2 ${className}`}>
        {value ? (
          <div className="relative group">
            <div className="relative aspect-video w-full max-w-xs bg-gray-100 rounded-lg overflow-hidden border">
              <Image
                src={value}
                alt="Selected image"
                fill
                className="object-cover"
                sizes="(max-width: 320px) 100vw, 320px"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="px-3 py-1.5 text-sm bg-white rounded-md hover:bg-gray-100"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 bg-white rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 w-full max-w-xs aspect-video border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ImagePlus className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-600">{label}</span>
          </button>
        )}
      </div>

      {/* Picker dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'library'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Media Library
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'upload'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload New
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {activeTab === 'library' && (
              <div className="space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search images..."
                      className="pl-10"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Search
                  </button>
                </div>

                {/* Media grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : media.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <ImagePlus className="w-12 h-12 mb-4 text-gray-300" />
                    <p>No images found</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="mt-2 text-primary hover:underline"
                    >
                      Upload some images
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {media.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedUrl(item.url)}
                        className={`
                          relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                          ${selectedUrl === item.url
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-transparent hover:border-gray-300'
                          }
                        `}
                      >
                        <Image
                          src={item.thumbnailUrl || item.url}
                          alt={item.alt || item.originalName}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                        {selectedUrl === item.url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <MediaUploader
                siteId={siteId}
                onUploadComplete={handleUploadComplete}
              />
            )}
          </div>

          {/* Footer */}
          {activeTab === 'library' && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelect}
                disabled={!selectedUrl}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Image
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
