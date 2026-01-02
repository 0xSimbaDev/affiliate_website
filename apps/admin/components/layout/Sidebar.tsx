'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  FileText,
  FolderOpen,
  Image,
  Settings,
  Users,
  Globe,
  X,
} from 'lucide-react'
import { cn } from '@affiliate/utils'
import { SiteSelector } from './SiteSelector'
import { UserMenu } from './UserMenu'
import { useSidebar } from './SidebarContext'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Articles', href: '/articles', icon: FileText },
  { label: 'Categories', href: '/categories', icon: FolderOpen },
  { label: 'Media', href: '/media', icon: Image },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const globalNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'All Sites', href: '/sites', icon: Globe },
  { label: 'Users', href: '/users', icon: Users, adminOnly: true },
]

function SidebarContent({ showCloseButton = false }: { showCloseButton?: boolean }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { close } = useSidebar()
  const isAdmin = session?.user?.role === 'ADMIN'

  // Extract current site ID from path
  const siteMatch = pathname.match(/\/sites\/([^/]+)/)
  const currentSiteId = siteMatch?.[1]

  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-semibold text-gray-900">Admin</span>
        </Link>
        {showCloseButton && (
          <button
            onClick={close}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Site Selector */}
      {currentSiteId && (
        <div className="px-4 py-4 border-b">
          <SiteSelector currentSiteId={currentSiteId} />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Site-specific navigation */}
        {currentSiteId && (
          <div className="px-3 mb-6">
            <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Site Content
            </p>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const href = `/sites/${currentSiteId}${item.href}`
                const isActive =
                  item.href === ''
                    ? pathname === `/sites/${currentSiteId}`
                    : pathname.startsWith(href)

                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Global navigation */}
        <div className="px-3">
          <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Platform
          </p>
          <ul className="space-y-1">
            {globalNavItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => {
                const isActive = pathname.startsWith(item.href)

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      </nav>

      {/* User Menu */}
      <div className="border-t p-4">
        <UserMenu />
      </div>
    </>
  )
}

export function Sidebar() {
  const { isOpen, close } = useSidebar()
  const sidebarRef = useRef<HTMLElement>(null)

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return

    const sidebar = sidebarRef.current
    if (!sidebar) return

    const focusableElements = sidebar.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus the first element when opened
    firstElement?.focus()

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  return (
    <>
      {/* Desktop Sidebar - always visible on lg screens */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-60 flex-col bg-white border-r hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - overlay with backdrop */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile Sidebar Panel */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-60 flex flex-col bg-white border-r transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <SidebarContent showCloseButton />
      </aside>
    </>
  )
}
