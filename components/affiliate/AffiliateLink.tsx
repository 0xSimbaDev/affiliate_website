import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AffiliateLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  partner?: string;
  children: React.ReactNode;
}

/**
 * AffiliateLink - Wrapper component for affiliate links
 *
 * Automatically adds:
 * - rel="nofollow sponsored noopener noreferrer" for SEO compliance
 * - target="_blank" to open in new tab
 * - Optional data-partner attribute for tracking
 */
export function AffiliateLink({
  href,
  partner,
  children,
  className,
  ...props
}: AffiliateLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      data-partner={partner}
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
}

export default AffiliateLink;
