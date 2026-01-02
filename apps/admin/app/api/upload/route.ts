import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@affiliate/database'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Generate a unique filename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const hash = crypto.randomBytes(8).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${hash}${ext}`
}

// Get image dimensions (basic implementation for common formats)
async function getImageDimensions(
  buffer: Buffer,
  mimeType: string
): Promise<{ width: number; height: number } | null> {
  try {
    // PNG dimensions
    if (mimeType === 'image/png') {
      if (buffer.length >= 24) {
        const width = buffer.readUInt32BE(16)
        const height = buffer.readUInt32BE(20)
        return { width, height }
      }
    }

    // JPEG dimensions
    if (mimeType === 'image/jpeg') {
      let offset = 2
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break
        const marker = buffer[offset + 1]
        if (marker === 0xc0 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5)
          const width = buffer.readUInt16BE(offset + 7)
          return { width, height }
        }
        const length = buffer.readUInt16BE(offset + 2)
        offset += 2 + length
      }
    }

    // GIF dimensions
    if (mimeType === 'image/gif') {
      if (buffer.length >= 10) {
        const width = buffer.readUInt16LE(6)
        const height = buffer.readUInt16LE(8)
        return { width, height }
      }
    }

    // WebP dimensions (simplified)
    if (mimeType === 'image/webp') {
      // Check for VP8 chunk
      if (buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF') {
        // VP8
        if (buffer.toString('ascii', 12, 16) === 'VP8 ') {
          const width = buffer.readUInt16LE(26) & 0x3fff
          const height = buffer.readUInt16LE(28) & 0x3fff
          return { width, height }
        }
        // VP8L (lossless)
        if (buffer.toString('ascii', 12, 16) === 'VP8L') {
          const bits = buffer.readUInt32LE(21)
          const width = (bits & 0x3fff) + 1
          const height = ((bits >> 14) & 0x3fff) + 1
          return { width, height }
        }
      }
    }

    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const siteId = formData.get('siteId') as string
    const files = formData.getAll('files') as File[]

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Verify site exists and user has access
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Check user access (admin can access all sites, owner needs to be assigned)
    if (session.user.role !== 'ADMIN') {
      const userSite = await prisma.userSite.findUnique({
        where: {
          userId_siteId: {
            userId: session.user.id,
            siteId,
          },
        },
      })

      if (!userSite) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', siteId)
    const thumbnailDir = path.join(uploadDir, 'thumbnails')

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    if (!existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true })
    }

    // Process each file
    const uploadedMedia = []
    const errors = []

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push({ file: file.name, error: 'File type not allowed' })
        continue
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({ file: file.name, error: 'File too large (max 10MB)' })
        continue
      }

      try {
        // Read file buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const filename = generateFilename(file.name)
        const filepath = path.join(uploadDir, filename)

        // Write file
        await writeFile(filepath, buffer)

        // Get image dimensions if applicable
        let dimensions: { width: number; height: number } | null = null
        if (file.type.startsWith('image/')) {
          dimensions = await getImageDimensions(buffer, file.type)
        }

        // Generate URL paths
        const url = `/uploads/${siteId}/${filename}`
        const thumbnailUrl = file.type.startsWith('image/')
          ? `/uploads/${siteId}/${filename}` // For now, use same image as thumbnail
          : null

        // Create database record
        const media = await prisma.media.create({
          data: {
            siteId,
            uploadedBy: session.user.id,
            filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url,
            thumbnailUrl,
            width: dimensions?.width || null,
            height: dimensions?.height || null,
          },
        })

        uploadedMedia.push(media)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        errors.push({ file: file.name, error: 'Upload failed' })
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedMedia,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
