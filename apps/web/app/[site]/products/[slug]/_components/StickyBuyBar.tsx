'use client'

import { useState, useEffect } from 'react'
import { cn } from '@affiliate/utils'
import { AffiliateLink } from '@affiliate/ui/affiliate/AffiliateLink'

interface StickyBuyBarProps {
  productName: string
  price: string | null
  affiliateUrl: string
  ctaText?: string
  partner?: string
  className?: string
}

/**
 * StickyBuyBar - Mobile sticky CTA bar
 *
 * Features:
 * - Fixed at bottom on mobile/tablet only
 * - Shows after scrolling past the main CTA
 * - Smooth entrance animation
 * - Truncated product name for small screens
 */
export default function StickyBuyBar({
  productName,
  price,
  affiliateUrl,
  ctaText = 'Check Price',
  partner,
  className,
}: StickyBuyBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the bar after scrolling 400px
      const scrollThreshold = 400
      setIsVisible(window.scrollY > scrollThreshold)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'lg:hidden', // Only show on mobile/tablet
        'transform transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full',
        className
      )}
    >
      {/* Gradient fade at top */}
      <div className="h-4 bg-gradient-to-t from-background to-transparent" />

      {/* Main bar */}
      <div
        className={cn(
          'bg-background/95 backdrop-blur-lg',
          'border-t border-border/50',
          'px-4 py-3 safe-area-bottom'
        )}
      >
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Product info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {productName}
            </p>
            {price && (
              <p className="text-lg font-bold text-foreground">{price}</p>
            )}
          </div>

          {/* CTA Button */}
          <AffiliateLink
            href={affiliateUrl}
            partner={partner}
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'px-6 py-3 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-[var(--site-primary)] hover:bg-[var(--site-primary)]/90',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--site-primary)]',
              'whitespace-nowrap flex-shrink-0'
            )}
          >
            {ctaText}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </AffiliateLink>
        </div>
      </div>
    </div>
  )
}
