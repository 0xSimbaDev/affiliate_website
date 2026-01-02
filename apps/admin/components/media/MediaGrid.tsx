'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileText, FileImage, File, Check } from 'lucide-react'
import type { MediaItem } from '@/app/(dashboard)/sites/[siteId]/media/actions'

interface MediaGridProps {
  media: MediaItem[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onItemClick: (media: MediaItem) => void
  selectionMode?: boolean
}

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Get icon for non-image files
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return FileImage
  }
  if (mimeType === 'application/pdf') {
    return FileText
  }
  return File
}

// Check if file is an image
function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function MediaGrid({
  media,
  selectedIds,
  onSelect,
  onItemClick,
  selectionMode = false,
}: MediaGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <FileImage className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No media files found</p>
        <p className="text-sm">Upload some files to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {media.map((item) => {
        const isSelected = selectedIds.includes(item.id)
        const isHovered = hoveredId === item.id
        const FileIcon = getFileIcon(item.mimeType)

        return (
          <div
            key={item.id}
            className={`
              relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
              ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent'}
              ${isHovered && !isSelected ? 'shadow-lg' : 'shadow-sm'}
              bg-white
            `}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              if (selectionMode) {
                onSelect(item.id)
              } else {
                onItemClick(item)
              }
            }}
          >
            {/* Thumbnail container */}
            <div className="aspect-square relative bg-gray-100">
              {isImage(item.mimeType) ? (
                <Image
                  src={item.url}
                  alt={item.alt || item.originalName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <FileIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Selection checkbox overlay */}
              <div
                className={`
                  absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-all
                  ${isSelected
                    ? 'bg-primary border-primary'
                    : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(item.id)
                }}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Hover info overlay */}
              <div
                className={`
                  absolute inset-0 bg-black/60 flex flex-col justify-end p-2
                  transition-opacity
                  ${isHovered && !selectionMode ? 'opacity-100' : 'opacity-0'}
                `}
              >
                <p className="text-white text-xs font-medium truncate">
                  {item.originalName}
                </p>
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <span>{formatFileSize(item.size)}</span>
                  {item.width && item.height && (
                    <>
                      <span>|</span>
                      <span>{item.width} x {item.height}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Filename below (visible on mobile/small screens) */}
            <div className="p-2 sm:hidden">
              <p className="text-xs text-gray-600 truncate">
                {item.originalName}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
