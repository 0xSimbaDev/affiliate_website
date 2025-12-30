'use client'

/**
 * AffiliatePartners Component
 *
 * Multi-affiliate display with expandable layout.
 * Shows primary CTA prominently with optional alternative retailers.
 */

import { useState } from 'react'
import { Button } from '../ui/button'
import { AffiliateLink } from './AffiliateLink'
import { cn } from '@affiliate/utils'
import type { AffiliateLink as AffiliateLinkType } from '@affiliate/types'

interface PartnerConfig {
  icon: React.ReactNode
  label: string
  color: string
}

const AmazonIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 01-.753.077c-1.058-.878-1.247-1.287-1.826-2.126-1.746 1.779-2.983 2.312-5.243 2.312-2.679 0-4.763-1.651-4.763-4.959 0-2.583 1.401-4.342 3.392-5.202 1.724-.763 4.135-.896 5.975-1.105v-.413c0-.76.061-1.659-.388-2.317-.39-.588-1.135-.83-1.795-.83-1.218 0-2.304.624-2.569 1.919-.054.286-.265.567-.554.582l-3.096-.333c-.262-.057-.551-.27-.479-.668C5.762 2.091 8.388.921 10.742.921c1.2 0 2.766.318 3.711 1.224 1.2 1.118 1.085 2.611 1.085 4.234v3.838c0 1.154.478 1.659.93 2.285.158.221.193.487-.008.654-.508.424-1.411 1.209-1.907 1.648l-.01-.009z"/>
    <path d="M21.63 18.2c-1.903 1.404-4.666 2.153-7.044 2.153-3.334 0-6.336-1.233-8.604-3.28-.178-.16-.019-.38.195-.256 2.451 1.426 5.483 2.285 8.613 2.285 2.111 0 4.434-.438 6.572-1.346.322-.14.593.212.268.444z"/>
    <path d="M22.418 17.148c-.243-.312-1.607-.147-2.22-.074-.186.023-.215-.14-.047-.257 1.088-.764 2.872-.544 3.078-.288.208.261-.054 2.069-1.074 2.932-.157.132-.307.062-.237-.113.231-.573.748-1.888.5-2.2z"/>
  </svg>
)

const BestBuyIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 3h15a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3zm7.5 4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 1.5a3 3 0 110 6 3 3 0 010-6z"/>
  </svg>
)

const NeweggIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="12" rx="10" ry="6" strokeWidth="2" stroke="currentColor" fill="none"/>
    <ellipse cx="12" cy="12" rx="4" ry="2.5" fill="currentColor"/>
  </svg>
)

const WalmartIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/>
  </svg>
)

const BHPhotoIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
)

const SephoraIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
)

const UltaIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-4 13h-7a1 1 0 010-2h7a1 1 0 010 2zm0-4h-7a1 1 0 010-2h7a1 1 0 010 2z"/>
  </svg>
)

const BookingIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm1 4v8h3V8H7zm5 0v8h3v-3h-1v-2h1V8h-3z"/>
  </svg>
)

const ExpediaIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none"/>
    <path d="M8 12h8M12 8v8"/>
  </svg>
)

const DefaultIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
  </svg>
)

const partnerConfig: Record<string, PartnerConfig> = {
  amazon: { icon: <AmazonIcon />, label: 'Amazon', color: '#FF9900' },
  bestbuy: { icon: <BestBuyIcon />, label: 'Best Buy', color: '#0046BE' },
  newegg: { icon: <NeweggIcon />, label: 'Newegg', color: '#E75B00' },
  walmart: { icon: <WalmartIcon />, label: 'Walmart', color: '#0071CE' },
  'b-h-photo': { icon: <BHPhotoIcon />, label: 'B&H Photo', color: '#000000' },
  'bh-photo': { icon: <BHPhotoIcon />, label: 'B&H Photo', color: '#000000' },
  sephora: { icon: <SephoraIcon />, label: 'Sephora', color: '#000000' },
  ulta: { icon: <UltaIcon />, label: 'Ulta', color: '#E91D8D' },
  'booking-com': { icon: <BookingIcon />, label: 'Booking.com', color: '#003580' },
  booking: { icon: <BookingIcon />, label: 'Booking.com', color: '#003580' },
  expedia: { icon: <ExpediaIcon />, label: 'Expedia', color: '#FEBA02' },
}

function getPartnerConfig(partner: string): PartnerConfig {
  const key = partner.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  return partnerConfig[key] || {
    icon: <DefaultIcon />,
    label: partner,
    color: 'var(--site-primary)',
  }
}

interface AffiliatePartnersProps {
  affiliateLinks: AffiliateLinkType[]
  primaryAffiliateUrl?: string | null
  ctaText?: string
  className?: string
}

export default function AffiliatePartners({
  affiliateLinks,
  primaryAffiliateUrl,
  ctaText = 'Check Price',
  className = '',
}: AffiliatePartnersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Sort links: primary first, then by partner name
  const sortedLinks = [...affiliateLinks].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return (a.label || a.partner).localeCompare(b.label || b.partner)
  })

  // Get primary link (first isPrimary, or first link, or fallback to primaryAffiliateUrl)
  const primaryLink = sortedLinks.find((l) => l.isPrimary) ||
    sortedLinks[0] ||
    (primaryAffiliateUrl ? { partner: 'store', url: primaryAffiliateUrl, label: 'Store', isPrimary: true } : null)

  const alternativeLinks = sortedLinks.filter((l) => l !== primaryLink)
  const hasAlternatives = alternativeLinks.length > 0

  if (!primaryLink) {
    return null
  }

  const primaryConfig = getPartnerConfig(primaryLink.partner)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Primary CTA */}
      <AffiliateLink
        href={primaryLink.url}
        partner={primaryLink.partner}
        className="block"
      >
        <Button variant="site" size="xl" className="w-full gap-3">
          <span className="flex items-center gap-2">
            {primaryConfig.icon}
            <span>{ctaText} on {primaryLink.label || primaryConfig.label}</span>
          </span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </Button>
      </AffiliateLink>

      {/* Compare Prices Toggle */}
      {hasAlternatives && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Compare at {alternativeLinks.length} other {alternativeLinks.length === 1 ? 'retailer' : 'retailers'}</span>
            <svg
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {/* Alternative Retailers */}
          {isExpanded && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
              {alternativeLinks.map((link, index) => {
                const config = getPartnerConfig(link.partner)
                return (
                  <AffiliateLink
                    key={`${link.partner}-${index}`}
                    href={link.url}
                    partner={link.partner}
                    className="flex items-center justify-between rounded-md bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      {config.icon}
                      <span className="font-medium">{link.label || config.label}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm text-[var(--site-primary)]">
                      View Price
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </AffiliateLink>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { AffiliatePartners }
