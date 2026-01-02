'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DuplicateProductButtonProps {
  onDuplicate: () => Promise<{
    success: boolean
    error?: string
    newProductId?: string
  }>
  siteId: string
}

export function DuplicateProductButton({
  onDuplicate,
  siteId,
}: DuplicateProductButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        const result = await onDuplicate()
        if (result.success && result.newProductId) {
          toast.success('Product duplicated successfully')
          router.push(`/sites/${siteId}/products/${result.newProductId}`)
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to duplicate product')
        }
      } catch (error) {
        toast.error('Failed to duplicate product')
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
