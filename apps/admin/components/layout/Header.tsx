'use client'

import { usePathname } from 'next/navigation'
import { Search, HelpCircle, Bell, Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: Array<{ label: string; href: string }> = []

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`

    // Skip dynamic segments that look like IDs
    if (segment.match(/^[a-z0-9]{20,}$/i)) {
      continue
    }

    // Capitalize and format segment
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({ label, href: currentPath })
  }

  return breadcrumbs
}

export function Header() {
  const pathname = usePathname()
  const { open } = useSidebar()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={open}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'font-medium text-gray-900'
                    : 'text-gray-500'
                }
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Help */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
