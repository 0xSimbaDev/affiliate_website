'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, Settings, ChevronUp } from 'lucide-react'
import { cn } from '@affiliate/utils'

export function UserMenu() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const user = session?.user

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <ChevronUp
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            !isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border rounded-md shadow-lg z-50 animate-fadeIn">
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/settings')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </button>
            <div className="border-t my-1" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
