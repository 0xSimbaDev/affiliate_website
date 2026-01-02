'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@affiliate/database'
import { z } from 'zod'

// Types
export interface MediaItem {
  id: string
  siteId: string
  uploadedBy: string | null
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  alt: string | null
  caption: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MediaQueryOptions {
  search?: string
  type?: 'images' | 'documents' | 'all'
  page?: number
  limit?: number
}

export interface MediaListResult {
  media: MediaItem[]
  total: number
  page: number
  totalPages: number
}

// Get media for a site with filters
export async function getMedia(
  siteId: string,
  options: MediaQueryOptions = {}
): Promise<MediaListResult> {
  const { search, type = 'all', page = 1, limit = 24 } = options
  const skip = (page - 1) * limit

  // Build where clause
  const where: {
    siteId: string
    mimeType?: { startsWith?: string; not?: { startsWith: string } }
    OR?: Array<{ originalName?: { contains: string; mode: 'insensitive' } } | { alt?: { contains: string; mode: 'insensitive' } }>
  } = { siteId }

  // Filter by type
  if (type === 'images') {
    where.mimeType = { startsWith: 'image/' }
  } else if (type === 'documents') {
    where.mimeType = { not: { startsWith: 'image/' } }
  }

  // Search by filename or alt text
  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: 'insensitive' } },
      { alt: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ])

  return {
    media: media as MediaItem[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

// Get a single media item
export async function getMediaById(
  siteId: string,
  mediaId: string
): Promise<MediaItem | null> {
  const media = await prisma.media.findFirst({
    where: {
      id: mediaId,
      siteId,
    },
  })

  return media as MediaItem | null
}

// Update media metadata
const updateMediaSchema = z.object({
  alt: z.string().max(255).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
})

export async function updateMedia(
  siteId: string,
  mediaId: string,
  data: z.infer<typeof updateMediaSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateMediaSchema.parse(data)

    // Check if media exists and belongs to this site
    const existing = await prisma.media.findFirst({
      where: {
        id: mediaId,
        siteId,
      },
    })

    if (!existing) {
      return { success: false, error: 'Media not found' }
    }

    await prisma.media.update({
      where: { id: mediaId },
      data: {
        alt: validated.alt || null,
        caption: validated.caption || null,
      },
    })

    revalidatePath(`/sites/${siteId}/media`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update media:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update media' }
  }
}

// Delete media
export async function deleteMedia(
  siteId: string,
  mediaId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if media exists and belongs to this site
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        siteId,
      },
    })

    if (!media) {
      return { success: false, error: 'Media not found' }
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    })

    // Note: In production, you'd also delete the file from storage here
    // For local storage, we could use fs.unlink, but for S3/Cloudinary
    // you'd call their respective delete APIs

    revalidatePath(`/sites/${siteId}/media`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete media:', error)
    return { success: false, error: 'Failed to delete media' }
  }
}

// Delete multiple media items
export async function deleteMultipleMedia(
  siteId: string,
  mediaIds: string[]
): Promise<{ success: boolean; error?: string; deleted: number }> {
  try {
    // Verify all media items belong to this site
    const count = await prisma.media.count({
      where: {
        id: { in: mediaIds },
        siteId,
      },
    })

    if (count !== mediaIds.length) {
      return {
        success: false,
        error: 'Some media items not found or do not belong to this site',
        deleted: 0
      }
    }

    // Delete all
    const result = await prisma.media.deleteMany({
      where: {
        id: { in: mediaIds },
        siteId,
      },
    })

    revalidatePath(`/sites/${siteId}/media`)
    return { success: true, deleted: result.count }
  } catch (error) {
    console.error('Failed to delete media:', error)
    return { success: false, error: 'Failed to delete media', deleted: 0 }
  }
}
