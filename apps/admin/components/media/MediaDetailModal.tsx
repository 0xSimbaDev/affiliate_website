'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { Copy, Trash2, Check, Loader2, FileText, File, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateMedia, deleteMedia } from '@/app/(dashboard)/sites/[siteId]/media/actions'
import type { MediaItem } from '@/app/(dashboard)/sites/[siteId]/media/actions'

interface MediaDetailModalProps {
  media: MediaItem | null
  siteId: string
  open: boolean
  onClose: () => void
  onDelete: () => void
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Format date
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Check if file is an image
function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// Get file icon
function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') {
    return FileText
  }
  return File
}

export function MediaDetailModal({
  media,
  siteId,
  open,
  onClose,
  onDelete,
}: MediaDetailModalProps) {
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset form when media changes
  useEffect(() => {
    if (media) {
      setAlt(media.alt || '')
      setCaption(media.caption || '')
    }
  }, [media?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!media) return null

  const FileIcon = getFileIcon(media.mimeType)

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    try {
      const fullUrl = `${window.location.origin}${media.url}`
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success('URL copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  // Save changes
  const handleSave = () => {
    startTransition(async () => {
      const result = await updateMedia(siteId, media.id, { alt, caption })
      if (result.success) {
        toast.success('Media updated successfully')
      } else {
        toast.error(result.error || 'Failed to update media')
      }
    })
  }

  // Delete media
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteMedia(siteId, media.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Media deleted successfully')
      onDelete()
      onClose()
    } else {
      toast.error(result.error || 'Failed to delete media')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{media.originalName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {isImage(media.mimeType) ? (
                  <Image
                    src={media.url}
                    alt={media.alt || media.originalName}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <FileIcon className="w-16 h-16 text-gray-400" />
                    <span className="text-sm text-gray-500">{media.mimeType}</span>
                  </div>
                )}
              </div>

              {/* URL with copy button */}
              <div className="space-y-2">
                <Label>File URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={media.url}
                    readOnly
                    className="flex-1 text-sm bg-gray-50"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                </div>
              </div>
            </div>

            {/* Details & Edit form */}
            <div className="space-y-6">
              {/* File metadata */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">File Details</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-gray-900">{media.mimeType}</dd>

                  <dt className="text-gray-500">Size</dt>
                  <dd className="text-gray-900">{formatFileSize(media.size)}</dd>

                  {media.width && media.height && (
                    <>
                      <dt className="text-gray-500">Dimensions</dt>
                      <dd className="text-gray-900">{media.width} x {media.height} px</dd>
                    </>
                  )}

                  <dt className="text-gray-500">Uploaded</dt>
                  <dd className="text-gray-900">{formatDate(media.createdAt)}</dd>
                </dl>
              </div>

              {/* Edit form */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900">Edit Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Describe this image for accessibility"
                  />
                  <p className="text-xs text-gray-500">
                    Used for accessibility and SEO
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Optional caption for this media"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>

              {/* Delete */}
              <div className="pt-4 border-t">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete File
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
