import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AffiliateDisclosureProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const disclosureTexts = {
  default:
    'This page contains affiliate links. We may earn a commission if you make a purchase through these links, at no additional cost to you.',
  compact: 'This page contains affiliate links.',
  detailed:
    'Disclosure: This page contains affiliate links to products and services. If you click through and make a purchase, we may receive a commission at no additional cost to you. This helps support our site and allows us to continue providing valuable content. We only recommend products we believe in.',
};

/**
 * AffiliateDisclosure - Standard affiliate disclosure notice
 *
 * Required for FTC compliance when displaying affiliate content.
 * Place near affiliate links or at the top of pages with affiliate content.
 */
export function AffiliateDisclosure({
  className,
  variant = 'default',
}: AffiliateDisclosureProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-muted bg-muted/50 px-4 py-3 text-xs text-muted-foreground',
        className
      )}
      role="note"
      aria-label="Affiliate disclosure"
    >
      <p className="m-0">{disclosureTexts[variant]}</p>
    </div>
  );
}

export default AffiliateDisclosure;
