'use client'

/**
 * Breadcrumb Section
 *
 * Navigation breadcrumb for product pages.
 * Shows: Home > Products > Category > Product Name
 */

import Link from 'next/link'
import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@/lib/utils'

export default function BreadcrumbSection({ className }: SectionProps) {
  const { breadcrumbItems, siteSlug, baseUrl } = useProductPage()

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('border-b border-border/50 bg-muted/30', className)}
    >
      <div className="container-wide section-padding py-3">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2 whitespace-nowrap">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-muted-foreground/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              )}
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url.replace(baseUrl, `/${siteSlug}`)}
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
