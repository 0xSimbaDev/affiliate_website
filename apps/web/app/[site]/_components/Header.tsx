'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@affiliate/utils'
import type { SiteWithNiche, ContentSlugType } from '@affiliate/types'
import { DEFAULT_CONTENT_SLUG } from '@affiliate/types'

interface HeaderProps {
  site: SiteWithNiche & { contentSlug?: ContentSlugType }
}

/**
 * Get navigation links with dynamic content slug
 * Clean, minimal navigation appropriate for affiliate/review sites
 * All links are site-scoped to support multi-site architecture
 */
function getNavLinks(siteSlug: string, contentSlug: ContentSlugType): Array<{ href: string; label: string }> {
  // Map content slug to appropriate label
  const contentLabels: Record<ContentSlugType, string> = {
    reviews: 'Reviews',
    articles: 'Articles',
    guides: 'Guides',
    blog: 'Blog',
  }

  return [
    { href: `/${siteSlug}/${contentSlug}`, label: contentLabels[contentSlug] },
    { href: `/${siteSlug}/products`, label: 'Products' },
    { href: `/${siteSlug}/categories`, label: 'Categories' },
  ]
}

/**
 * Search Icon Component
 */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  )
}

/**
 * Header Component
 *
 * A professional, trustworthy header for a multi-site affiliate platform.
 * Design principles:
 * - Clean and minimal to convey editorial credibility
 * - Clear site identity with niche context
 * - Easy navigation to key sections (Reviews, Guides, Deals)
 * - Subtle scroll effects for polish
 * - Mobile-first responsive design
 */
export default function Header({ site }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Get the content slug from site config with default fallback
  const contentSlug = site.contentSlug || DEFAULT_CONTENT_SLUG
  const siteSlug = site.slug
  const navLinks = getNavLinks(siteSlug, contentSlug)

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsSearchOpen(false)
      }
    }

    if (isMobileMenuOpen || isSearchOpen) {
      document.addEventListener('keydown', handleEscape)
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden'
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isSearchOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-background/80 backdrop-blur-sm'
      )}
    >
      <div className="container-wide section-padding">
        <nav className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo / Brand */}
          <Link
            href={`/${siteSlug}`}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg"
            aria-label={`${site.name} home`}
          >
            {/* Logo Mark */}
            <div
              className="relative flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm text-white transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              {site.name.charAt(0)}
            </div>

            {/* Site Name */}
            <div className="flex flex-col">
              <span className="font-semibold text-foreground tracking-tight leading-none">
                {site.name}
              </span>
              {site.niche && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {site.niche.name}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 text-sm font-medium text-muted-foreground',
                  'rounded-lg transition-colors duration-150',
                  'hover:text-foreground hover:bg-muted/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'text-sm text-muted-foreground',
                'bg-muted/50 hover:bg-muted',
                'border border-border/50',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
              aria-label="Search"
            >
              <SearchIcon className="w-4 h-4" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background rounded border border-border">
                <span className="text-xs">/</span>
              </kbd>
            </button>

            {/* About / Trust Link */}
            <Link
              href={`/${siteSlug}/about`}
              className={cn(
                'px-3.5 py-2 text-sm font-medium text-muted-foreground',
                'rounded-lg transition-colors duration-150',
                'hover:text-foreground hover:bg-muted/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
            >
              About Us
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                'flex items-center justify-center w-10 h-10',
                'rounded-lg text-muted-foreground',
                'hover:text-foreground hover:bg-muted/50',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={cn(
                'flex items-center justify-center w-10 h-10',
                'rounded-lg text-muted-foreground',
                'hover:text-foreground hover:bg-muted/50',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-border bg-background shadow-lg">
            <div className="container-wide section-padding py-4">
              <div className="relative max-w-2xl mx-auto">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reviews, guides, and deals..."
                  className={cn(
                    'w-full pl-12 pr-4 py-3 rounded-lg',
                    'text-foreground placeholder:text-muted-foreground',
                    'bg-muted/50 border border-border',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'transition-colors duration-150'
                  )}
                  style={{ '--tw-ring-color': 'var(--site-primary)' } as React.CSSProperties}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  ESC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={cn(
          'lg:hidden fixed top-16 left-0 right-0 z-50',
          'bg-background border-b border-border',
          'shadow-lg',
          'transition-all duration-200 ease-out',
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="section-padding py-4">
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-1" role="navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 text-base font-medium text-foreground',
                  'rounded-lg transition-colors duration-150',
                  'hover:bg-muted/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Footer Links */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/${siteSlug}/about`}
                className={cn(
                  'px-4 py-3 text-sm font-medium text-muted-foreground',
                  'rounded-lg transition-colors duration-150',
                  'hover:bg-muted/50 hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href={`/${siteSlug}/contact`}
                className={cn(
                  'px-4 py-3 text-sm font-medium text-muted-foreground',
                  'rounded-lg transition-colors duration-150',
                  'hover:bg-muted/50 hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                style={{ color: 'var(--site-primary)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              <span>Independent Reviews Since 2020</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
