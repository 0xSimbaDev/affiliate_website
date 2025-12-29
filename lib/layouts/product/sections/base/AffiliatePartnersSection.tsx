'use client'

/**
 * Affiliate Partners Section
 *
 * Displays multi-affiliate CTAs and disclosure.
 * Shows all available purchase options from different partners.
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@/lib/utils'
import AffiliatePartners from '@/components/affiliate/AffiliatePartners'
import { AffiliateDisclosure } from '@/components/affiliate/AffiliateDisclosure'

export default function AffiliatePartnersSection({ className }: SectionProps) {
  const { affiliateLinks, product, ctaText } = useProductPage()

  const hasLinks = affiliateLinks.length > 0 || product.primaryAffiliateUrl

  if (!hasLinks) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      <AffiliatePartners
        affiliateLinks={affiliateLinks}
        primaryAffiliateUrl={product.primaryAffiliateUrl}
        ctaText={ctaText}
      />
      <AffiliateDisclosure variant="compact" />
    </div>
  )
}
