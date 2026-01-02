'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, FileImage, File, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface MediaUploaderProps {
  siteId: string
  onUploadComplete: () => void
}

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function MediaUploader({ siteId, onUploadComplete }: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not allowed. Use JPG, PNG, GIF, WebP, or SVG.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.'
    }
    return null
  }

  // Add files to queue
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const uploadFiles: UploadedFile[] = fileArray.map((file) => {
      const error = validateFile(file)
      return {
        file,
        id: generateId(),
        status: error ? 'error' : 'pending',
        progress: 0,
        error: error || undefined,
      }
    })
    setFiles((prev) => [...prev, ...uploadFiles])
  }, [])

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }, [addFiles])

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  // Remove file from queue
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Upload all pending files
  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Mark all as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f
      )
    )

    // Create form data with all files
    const formData = new FormData()
    formData.append('siteId', siteId)
    pendingFiles.forEach((f) => {
      formData.append('files', f.file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Mark successful uploads
        setFiles((prev) =>
          prev.map((f) => {
            if (f.status === 'uploading') {
              const uploadedFile = result.uploaded.find(
                (u: { originalName: string }) => u.originalName === f.file.name
              )
              const uploadError = result.errors?.find(
                (e: { file: string }) => e.file === f.file.name
              )

              if (uploadedFile) {
                return { ...f, status: 'success' as const, progress: 100 }
              } else if (uploadError) {
                return { ...f, status: 'error' as const, error: uploadError.error }
              }
            }
            return f
          })
        )

        // Notify parent
        onUploadComplete()

        // Clear successful uploads after delay
        setTimeout(() => {
          setFiles((prev) => prev.filter((f) => f.status !== 'success'))
        }, 2000)
      } else {
        // Mark all as error
        setFiles((prev) =>
          prev.map((f) =>
            f.status === 'uploading'
              ? { ...f, status: 'error' as const, error: result.error || 'Upload failed' }
              : f
          )
        )
      }
    } catch (error) {
      console.error('Upload error:', error)
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? { ...f, status: 'error' as const, error: 'Network error' }
            : f
        )
      )
    }

    setIsUploading(false)
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all
          ${isDragging
            ? 'border-primary bg-primary-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-3
            ${isDragging ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, GIF, WebP, SVG (max 10MB)
          </p>
        </div>
      </div>

      {/* File queue */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            {pendingCount > 0 && (
              <button
                onClick={uploadFiles}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${uploadFile.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-white'}
                  ${uploadFile.status === 'success' ? 'bg-green-50 border-green-200' : ''}
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.file.type.startsWith('image/') ? (
                    <FileImage className="w-8 h-8 text-gray-400" />
                  ) : (
                    <File className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.error && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {uploadFile.error}
                    </p>
                  )}
                </div>

                {/* Status/Actions */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {uploadFile.status === 'error' && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
