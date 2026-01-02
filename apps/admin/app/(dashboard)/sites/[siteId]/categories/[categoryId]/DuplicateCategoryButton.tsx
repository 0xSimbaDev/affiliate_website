'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DuplicateCategoryButtonProps {
  onDuplicate: () => Promise<{ success: boolean; error?: string; newCategoryId?: string }>
  siteId: string
}

export function DuplicateCategoryButton({
  onDuplicate,
  siteId,
}: DuplicateCategoryButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await onDuplicate()
      if (result.success && result.newCategoryId) {
        toast.success('Category duplicated successfully')
        router.push(`/sites/${siteId}/categories/${result.newCategoryId}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to duplicate category')
      }
    })
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      Duplicate
    </button>
  )
}
