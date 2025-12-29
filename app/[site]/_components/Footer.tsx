import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SiteWithNiche, ContentSlugType } from '@/lib/types'
import { DEFAULT_CONTENT_SLUG } from '@/lib/types'

interface FooterProps {
  site: SiteWithNiche & { contentSlug?: ContentSlugType }
}

/**
 * Get footer link groups with dynamic content slug
 * All links are site-scoped to support multi-site architecture
 */
function getFooterLinks(siteSlug: string, contentSlug: ContentSlugType) {
  // Map content slug to appropriate label
  const contentLabels: Record<ContentSlugType, string> = {
    reviews: 'Reviews',
    articles: 'Articles',
    guides: 'Guides',
    blog: 'Blog',
  }

  return {
    browse: {
      title: 'Browse',
      links: [
        { href: `/${siteSlug}/products`, label: 'All Products' },
        { href: `/${siteSlug}/categories`, label: 'Categories' },
        { href: `/${siteSlug}/${contentSlug}`, label: contentLabels[contentSlug] },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { href: `/${siteSlug}/about`, label: 'About Us' },
        { href: `/${siteSlug}/contact`, label: 'Contact' },
        { href: `/${siteSlug}/how-we-review`, label: 'How We Review' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { href: `/${siteSlug}/privacy`, label: 'Privacy Policy' },
        { href: `/${siteSlug}/terms`, label: 'Terms of Service' },
        { href: `/${siteSlug}/disclaimer`, label: 'Affiliate Disclaimer' },
      ],
    },
  }
}

/**
 * Social Icon Component
 */
function SocialIcon({
  platform,
  href,
}: {
  platform: string
  href: string
}) {
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    youtube: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-lg',
        'text-muted-foreground hover:text-foreground',
        'bg-muted/50 hover:bg-muted',
        'transition-colors duration-150'
      )}
      aria-label={`Follow us on ${platform}`}
    >
      {icons[platform]}
    </a>
  )
}

/**
 * Footer Component
 *
 * A clean, professional footer with:
 * - Organized link sections
 * - Social media links
 * - Affiliate disclosure (required for compliance)
 * - Newsletter signup option
 * - Accessible and responsive design
 */
export default function Footer({ site }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Get the content slug from site config with default fallback
  const contentSlug = site.contentSlug || DEFAULT_CONTENT_SLUG
  const siteSlug = site.slug
  const footerLinks = getFooterLinks(siteSlug, contentSlug)

  const social = site.social as {
    twitter?: string
    facebook?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  } | null

  const hasSocialLinks = social && Object.values(social).some(Boolean)

  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* Main Footer Content */}
      <div className="container-wide section-padding py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-10 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4">
            {/* Logo */}
            <Link href={`/${siteSlug}`} className="inline-flex items-center gap-3 group">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg text-white font-semibold"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                {site.name.charAt(0)}
              </div>
              <span className="font-semibold text-lg text-foreground">
                {site.name}
              </span>
            </Link>

            {/* Description */}
            {site.description && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
                {site.description}
              </p>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="mt-6 flex items-center gap-2">
                {social?.twitter && (
                  <SocialIcon platform="twitter" href={social.twitter} />
                )}
                {social?.facebook && (
                  <SocialIcon platform="facebook" href={social.facebook} />
                )}
                {social?.instagram && (
                  <SocialIcon platform="instagram" href={social.instagram} />
                )}
                {social?.youtube && (
                  <SocialIcon platform="youtube" href={social.youtube} />
                )}
                {social?.linkedin && (
                  <SocialIcon platform="linkedin" href={social.linkedin} />
                )}
              </div>
            )}
          </div>

          {/* Browse Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {footerLinks.browse.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.browse.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-muted-foreground',
                      'hover:text-foreground transition-colors duration-150'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {footerLinks.company.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-muted-foreground',
                      'hover:text-foreground transition-colors duration-150'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {footerLinks.legal.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-muted-foreground',
                      'hover:text-foreground transition-colors duration-150'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-wide section-padding py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {currentYear} {site.name}. All rights reserved.
            </p>
            {site.niche && (
              <p className="text-xs text-muted-foreground">
                Part of the {site.niche.name} Network
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
