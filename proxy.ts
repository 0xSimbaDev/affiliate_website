/**
 * Domain-based Proxy Middleware
 *
 * Handles multi-site routing by:
 * 1. Extracting hostname from request
 * 2. Looking up site slug from domain mappings
 * 3. Rewriting URL to include site slug as first path segment
 *
 * Example: thegaminghubguide.com/products -> /demo-gaming/products
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import domainMappings from '@/lib/config/domain-mappings.json'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Redirect www to non-www with 301 permanent redirect for SEO
  if (hostname.startsWith('www.')) {
    const newHost = hostname.replace(/^www\./, '')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    const { search } = request.nextUrl
    const redirectUrl = `${proto}://${newHost}${pathname}${search}`
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get site slug from hostname
  const siteSlug = getSiteSlugFromHostname(hostname, request)

  // If path already includes site slug, continue
  if (pathname.startsWith(`/${siteSlug}`)) {
    return NextResponse.next()
  }

  // Rewrite URL to include site slug as first path segment
  const url = request.nextUrl.clone()
  url.pathname = `/${siteSlug}${pathname}`

  return NextResponse.rewrite(url)
}

/**
 * Extract site slug from hostname using domain mappings.
 * Query param takes priority for development convenience.
 */
function getSiteSlugFromHostname(hostname: string, request: NextRequest): string {
  // Remove port number for lookup
  const cleanHostname = hostname.split(':')[0]

  // Remove www prefix
  const domain = cleanHostname.replace(/^www\./, '')

  // Check domain mappings
  const domainMap = domainMappings as Record<string, string>

  // Priority 1: Check query param for development (allows easy site switching)
  const searchParams = request.nextUrl.searchParams
  const siteParam = searchParams.get('site')
  if (siteParam) {
    return siteParam
  }

  // Priority 2: Try exact hostname match (includes port for localhost subdomains)
  if (domainMap[hostname]) {
    return domainMap[hostname]
  }

  // Priority 3: Try without port
  if (domainMap[domain]) {
    return domainMap[domain]
  }

  // Default to localhost mapping or 'demo-gaming'
  return domainMap['localhost'] || 'demo-gaming'
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
