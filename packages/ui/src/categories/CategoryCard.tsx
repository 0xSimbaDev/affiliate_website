import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@affiliate/utils'
import type { CategoryReference } from '@affiliate/types'

// Type that works for both full Category and minimal CategoryReference
export type CategoryCardData = CategoryReference & {
  description?: string | null
  icon?: string | null
  featuredImage?: string | null
  _count?: {
    products: number
  }
}

export interface CategoryCardProps {
  category: CategoryCardData
  siteSlug: string
  className?: string
  /** Card variant for different layouts */
  variant?: 'default' | 'compact' | 'grid'
}

/**
 * Category Icon Component
 * Renders icon as image, emoji, or fallback letter
 */
function CategoryIcon({
  icon,
  name,
  size = 'md',
}: {
  icon: string | null | undefined
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-14 h-14 text-2xl',
  }

  // Check if icon is a URL
  if (icon && (icon.startsWith('http') || icon.startsWith('/'))) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl',
          sizeClasses[size]
        )}
      >
        <Image
          src={icon}
          alt={name}
          fill
          className="object-cover"
          sizes={size === 'lg' ? '56px' : size === 'md' ? '48px' : '40px'}
        />
      </div>
    )
  }

  // Icon is emoji or fallback to first letter
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl',
        'bg-muted transition-colors duration-200',
        'group-hover:bg-[var(--site-primary-10)]',
        sizeClasses[size]
      )}
      style={
        {
          '--site-primary-10': 'color-mix(in srgb, var(--site-primary) 10%, transparent)',
        } as React.CSSProperties
      }
    >
      <span className="font-semibold text-muted-foreground group-hover:text-[var(--site-primary)] transition-colors">
        {icon || name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

/**
 * CategoryCard Component
 *
 * A clean, minimal category card for navigation.
 * Features:
 * - Flexible icon display (image, emoji, or letter)
 * - Product count indicator
 * - Subtle hover interactions
 * - Multiple layout variants
 * - Accessible markup
 */
export function CategoryCard({
  category,
  siteSlug,
  className,
  variant = 'default',
}: CategoryCardProps) {
  const categoryUrl = `/${siteSlug}/categories/${category.slug}`
  const productCount = category._count?.products

  // Grid variant - compact square cards
  if (variant === 'grid') {
    return (
      <Link
        href={categoryUrl}
        className={cn(
          'group flex flex-col items-center justify-center p-6',
          'bg-card rounded-xl border border-border/50',
          'transition-all duration-200',
          'hover:border-border hover:shadow-md',
          'hover:border-[var(--site-primary-20)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
        style={
          {
            '--site-primary-20': 'color-mix(in srgb, var(--site-primary) 20%, transparent)',
          } as React.CSSProperties
        }
      >
        {category.featuredImage ? (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden mb-3">
            <Image
              src={category.featuredImage}
              alt={category.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ) : (
          <div className="mb-3">
            <CategoryIcon icon={category.icon} name={category.name} size="lg" />
          </div>
        )}

        <h3 className="text-sm font-medium text-foreground text-center group-hover:text-[var(--site-primary)] transition-colors">
          {category.name}
        </h3>

        {productCount !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </p>
        )}
      </Link>
    )
  }

  // Compact variant - horizontal minimal
  if (variant === 'compact') {
    return (
      <Link
        href={categoryUrl}
        className={cn(
          'group flex items-center gap-3 p-3',
          'bg-card rounded-lg border border-border/50',
          'transition-all duration-200',
          'hover:border-border hover:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
      >
        <CategoryIcon icon={category.icon} name={category.name} size="sm" />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-[var(--site-primary)] transition-colors">
            {category.name}
          </h3>
          {productCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        <svg
          className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )
  }

  // Default variant - full card with description
  return (
    <Link
      href={categoryUrl}
      className={cn(
        'group block p-5',
        'bg-card rounded-xl border border-border/50',
        'transition-all duration-200',
        'hover:border-border hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon or Featured Image */}
        {category.featuredImage ? (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
            <Image
              src={category.featuredImage}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="64px"
            />
          </div>
        ) : (
          <CategoryIcon icon={category.icon} name={category.name} size="lg" />
        )}

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-[var(--site-primary)] transition-colors">
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Product Count */}
          {productCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-2">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        {/* Arrow Icon */}
        <svg
          className={cn(
            'w-5 h-5 flex-shrink-0 mt-1',
            'text-muted-foreground/50',
            'transition-all duration-200',
            'group-hover:text-foreground group-hover:translate-x-1'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

export default CategoryCard
