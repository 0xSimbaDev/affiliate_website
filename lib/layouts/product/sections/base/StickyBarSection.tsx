'use client'

/**
 * Sticky Bar Section
 *
 * Mobile sticky CTA bar that appears after scrolling.
 * Fixed at bottom on mobile/tablet only.
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import StickyBuyBar from '@/app/[site]/products/[slug]/_components/StickyBuyBar'

export default function StickyBarSection({ className }: SectionProps) {
  const { product, price, ctaText, primaryPartner } = useProductPage()

  if (!product.primaryAffiliateUrl) {
    return null
  }

  return (
    <StickyBuyBar
      productName={product.title}
      price={price.primary}
      affiliateUrl={product.primaryAffiliateUrl}
      ctaText={ctaText}
      partner={primaryPartner}
      className={className}
    />
  )
}
