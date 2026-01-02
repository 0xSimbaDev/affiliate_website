'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCategory } from './actions'

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
  siteId: string
  hasChildren: boolean
  hasProducts: boolean
  variant?: 'icon' | 'button'
  redirectOnDelete?: boolean
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  siteId,
  hasChildren,
  hasProducts,
  variant = 'icon',
  redirectOnDelete = false,
}: DeleteCategoryButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(siteId, categoryId)
      if (result.success) {
        toast.success('Category deleted successfully')
        if (redirectOnDelete) {
          router.push(`/sites/${siteId}/categories`)
        }
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
      setShowConfirm(false)
    })
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="Delete"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isPending && setShowConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Category
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to delete{' '}
                    <span className="font-medium text-gray-700">
                      {categoryName}
                    </span>
                    ? This action cannot be undone.
                    {(hasChildren || hasProducts) && (
                      <span className="block mt-2 text-amber-600 font-medium">
                        Warning: {hasChildren && 'This category has subcategories that will become root categories. '}
                        {hasProducts && 'Product associations will be removed. '}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !isPending && setShowConfirm(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isPending}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
