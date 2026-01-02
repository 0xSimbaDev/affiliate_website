'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DuplicateArticleButtonProps {
  onDuplicate: () => Promise<{ success: boolean; error?: string; newArticleId?: string }>
  siteId: string
}

export function DuplicateArticleButton({
  onDuplicate,
  siteId,
}: DuplicateArticleButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        const result = await onDuplicate()
        if (result.success && result.newArticleId) {
          toast.success('Article duplicated successfully')
          router.push(`/sites/${siteId}/articles/${result.newArticleId}`)
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to duplicate article')
        }
      } catch (error) {
        toast.error('Failed to duplicate article')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
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
