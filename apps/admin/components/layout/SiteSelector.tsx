'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronDown, Check, Plus } from 'lucide-react'
import { cn } from '@affiliate/utils'

interface SiteSelectorProps {
  currentSiteId: string
}

export function SiteSelector({ currentSiteId }: SiteSelectorProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const sites = session?.user?.sites || []
  const currentSite = sites.find((s) => s.id === currentSiteId)
  const isAdmin = session?.user?.role === 'ADMIN'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleSiteChange = (siteId: string) => {
    setIsOpen(false)
    router.push(`/sites/${siteId}`)
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border rounded-md hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
            {currentSite?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <span className="text-sm font-medium text-gray-900 truncate">
            {currentSite?.name || 'Select Site'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 animate-fadeIn">
          <div className="py-1">
            <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">
              Your Sites
            </p>
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSiteChange(site.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  {site.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-left truncate">{site.name}</span>
                {site.id === currentSiteId && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          {isAdmin && (
            <>
              <div className="border-t" />
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/sites/new')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                Add New Site
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
