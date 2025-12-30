/**
 * Section Header Component
 *
 * Consistent section title styling for homepage sections.
 * Supports optional label, description, and action link.
 */

import Link from 'next/link'
import { cn } from '@affiliate/utils'

interface SectionHeaderProps {
  /** Optional uppercase label above the title */
  label?: string
  /** Main section title */
  title: string
  /** Optional description text */
  description?: string
  /** Text alignment - defaults to left */
  align?: 'left' | 'center'
  /** Optional action link displayed on the right */
  action?: {
    href: string
    label: string
  }
}

export function SectionHeader({
  label,
  title,
  description,
  align = 'left',
  action,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-8 lg:mb-10', align === 'center' && 'text-center')}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {label && (
            <p
              className="mb-2 text-sm font-medium uppercase tracking-wide"
              style={{ color: 'var(--site-primary)' }}
            >
              {label}
            </p>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'mt-3 leading-relaxed text-muted-foreground',
                align === 'center' ? 'mx-auto max-w-xl' : 'max-w-2xl'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="hidden items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {action.label}
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
