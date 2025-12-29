import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { SiteWithNiche } from '@/lib/types'

/**
 * Hero background images for each niche
 * Using high-quality Unsplash images optimized for hero sections
 */
const NICHE_HERO_IMAGES: Record<string, { url: string; alt: string; photographer: string }> = {
  gaming: {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80&fit=crop',
    alt: 'Gaming setup with RGB lighting and gaming peripherals',
    photographer: 'Florian Olivo',
  },
  tech: {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80&fit=crop',
    alt: 'Circuit board with technology components',
    photographer: 'Alexandre Debieve',
  },
  health: {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80&fit=crop',
    alt: 'Person doing yoga in a peaceful natural setting',
    photographer: 'Dane Wetton',
  },
  finance: {
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&fit=crop',
    alt: 'Stock market trading charts and financial data',
    photographer: 'Nicholas Cappello',
  },
  // Fallback for other niches
  default: {
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80&fit=crop',
    alt: 'Abstract gradient background',
    photographer: 'Luke Chesser',
  },
}

/**
 * Get the hero image configuration for a given niche
 */
function getHeroImage(nicheSlug: string | undefined) {
  if (!nicheSlug) return NICHE_HERO_IMAGES.default
  return NICHE_HERO_IMAGES[nicheSlug.toLowerCase()] || NICHE_HERO_IMAGES.default
}

interface HeroProps {
  site: SiteWithNiche
  /** Override the default title */
  title?: string
  /** Override the default subtitle */
  subtitle?: string
  /** Override the default description */
  description?: string
  /** Primary CTA text */
  primaryCta?: {
    text: string
    href: string
  }
  /** Secondary CTA text */
  secondaryCta?: {
    text: string
    href: string
  }
  /** Layout variant */
  variant?: 'default' | 'centered' | 'minimal'
  /** Show background image based on niche (default: true) */
  showBackgroundImage?: boolean
  /** Custom background image URL (overrides niche default) */
  backgroundImageUrl?: string
  /** Overlay opacity (0-100, default: 70) */
  overlayOpacity?: number
}

/**
 * Trust Indicators Component
 * Shows social proof and credibility markers
 */
function TrustIndicators() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 pt-8 mt-8 border-t border-border/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg
          className="w-5 h-5 text-site-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          style={{ color: 'var(--site-primary)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
        <span>Expert Reviews</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg
          className="w-5 h-5 text-site-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          style={{ color: 'var(--site-primary)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
        <span>Updated Daily</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg
          className="w-5 h-5 text-site-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          style={{ color: 'var(--site-primary)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <span>Trusted by 100K+ Readers</span>
      </div>
    </div>
  )
}

/**
 * Hero Component
 *
 * A clean, compelling hero section inspired by modern SaaS and editorial sites.
 * Features:
 * - Typography-first design with clear hierarchy
 * - Subtle gradient background tied to site theme
 * - Trust indicators for credibility
 * - Responsive design with mobile-first approach
 * - Accessible and semantic markup
 */
export default function Hero({
  site,
  title,
  subtitle,
  description,
  primaryCta = { text: 'Browse Products', href: '/products' },
  secondaryCta = { text: 'View Categories', href: '/categories' },
  variant = 'default',
  showBackgroundImage = true,
  backgroundImageUrl,
  overlayOpacity = 70,
}: HeroProps) {
  const displayTitle = title || site.name
  const displaySubtitle = subtitle || site.tagline
  const displayDescription = description || site.description

  // Get the hero image based on niche
  const heroImage = getHeroImage(site.niche?.slug)
  const imageUrl = backgroundImageUrl || heroImage.url
  const imageAlt = heroImage.alt

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        variant === 'minimal' ? 'py-16 lg:py-20' : 'py-20 lg:py-28'
      )}
    >
      {/* Background Image */}
      {showBackgroundImage && (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
          </div>
          {/* Dark overlay for text readability */}
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-b from-background/80 via-background/70 to-background"
            style={{ opacity: overlayOpacity / 100 }}
            aria-hidden="true"
          />
          {/* Color tint overlay matching site theme */}
          <div
            className="absolute inset-0 z-[2] opacity-30 mix-blend-overlay"
            style={{
              background: `linear-gradient(135deg, var(--site-primary) 0%, transparent 50%, var(--site-secondary) 100%)`,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Background gradient (shown when no image or as additional layer) */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background',
          showBackgroundImage ? 'z-[3]' : 'z-0'
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute inset-0 opacity-[0.02]',
          showBackgroundImage ? 'z-[3]' : 'z-0'
        )}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--site-primary) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Gradient orb */}
      <div
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20 blur-3xl pointer-events-none',
          showBackgroundImage ? 'z-[3]' : 'z-0'
        )}
        style={{
          background: `radial-gradient(ellipse at center, var(--site-primary), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 container-wide section-padding">
        <div
          className={cn(
            'max-w-3xl',
            variant === 'centered' && 'mx-auto text-center'
          )}
        >
          {/* Badge */}
          {site.niche && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted mb-6">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--site-primary)' }}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {site.niche.name} Reviews & Guides
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            {displayTitle}
          </h1>

          {/* Subtitle */}
          {displaySubtitle && (
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium mb-4 max-w-2xl">
              {displaySubtitle}
            </p>
          )}

          {/* Description */}
          {displayDescription && (
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-xl">
              {displayDescription}
            </p>
          )}

          {/* CTAs */}
          <div
            className={cn(
              'flex flex-col sm:flex-row gap-3',
              variant === 'centered' && 'justify-center'
            )}
          >
            <Link
              href={primaryCta.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-6 py-3',
                'text-base font-medium text-white rounded-lg',
                'btn-site-primary',
                'focus:outline-none focus:ring-2 focus:ring-offset-2'
              )}
            >
              {primaryCta.text}
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
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href={secondaryCta.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-6 py-3',
                'text-base font-medium rounded-lg',
                'border border-border bg-background',
                'hover:bg-muted transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-2'
              )}
            >
              {secondaryCta.text}
            </Link>
          </div>

          {/* Trust Indicators */}
          {variant !== 'minimal' && <TrustIndicators />}
        </div>
      </div>
    </section>
  )
}
