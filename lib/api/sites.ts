/**
 * Site API Functions
 *
 * Server-side data fetching functions for sites.
 * Uses React cache() for request-level deduplication.
 */

import { cache } from 'react'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import type { SiteWithNiche, SiteReference } from '@/lib/types'
import domainMappings from '@/lib/config/domain-mappings.json'

/**
 * Get a site by its slug with niche configuration.
 *
 * @param slug - The site's URL-safe slug
 * @returns The site with its niche, or null if not found
 *
 * @example
 * const site = await getSiteBySlug('best-travel-deals')
 */
export const getSiteBySlug = cache(async (slug: string): Promise<SiteWithNiche | null> => {
  const site = await prisma.site.findUnique({
    where: { slug },
    include: { niche: true },
  })

  if (!site) return null

  return site as unknown as SiteWithNiche
})

/**
 * Get a site by its domain with niche configuration.
 * Used by middleware for domain routing.
 *
 * @param domain - The site's custom domain
 * @returns The site with its niche, or null if not found
 *
 * @example
 * const site = await getSiteByDomain('besttraveldeals.com')
 */
export const getSiteByDomain = cache(async (domain: string): Promise<SiteWithNiche | null> => {
  const site = await prisma.site.findUnique({
    where: { domain },
    include: { niche: true },
  })

  if (!site) return null

  return site as unknown as SiteWithNiche
})

/**
 * Get site from request headers.
 * Auto-detects domain from the request and resolves the site.
 * Uses React cache() for request-level deduplication.
 *
 * This is the primary function for layouts and pages to get site context.
 *
 * @returns The site with its niche, or null if not found
 *
 * @example
 * // In a layout or page component:
 * const site = await getCurrentSite()
 */
export const getCurrentSite = cache(async (): Promise<SiteWithNiche | null> => {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'

  // Clean hostname (remove port and www)
  const cleanHost = host.split(':')[0].replace(/^www\./, '')

  // Look up site slug from domain mappings
  const domainMap = domainMappings as Record<string, string>
  const siteSlug = domainMap[host] || domainMap[cleanHost] || domainMap['localhost']

  if (!siteSlug) {
    console.warn(`No site mapping found for host: ${host}`)
    return null
  }

  // Fetch site from database by slug
  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: { niche: true },
  })

  if (!site) {
    console.warn(`Site not found for slug: ${siteSlug}`)
    return null
  }

  return site as unknown as SiteWithNiche
})

/**
 * Get all active sites.
 * Used for sitemap generation and admin dashboards.
 *
 * @returns Array of active sites
 *
 * @example
 * const sites = await getAllSites()
 */
export const getAllSites = cache(async (): Promise<SiteReference[]> => {
  const sites = await prisma.site.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      domain: true,
    },
    orderBy: { name: 'asc' },
  })

  return sites
})

/**
 * Get all sites for a specific niche.
 *
 * @param nicheId - The niche ID to filter by
 * @returns Array of sites in the niche
 *
 * @example
 * const travelSites = await getSitesByNiche('niche-id-123')
 */
export const getSitesByNiche = cache(async (nicheId: string): Promise<SiteReference[]> => {
  const sites = await prisma.site.findMany({
    where: {
      nicheId,
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      domain: true,
    },
    orderBy: { name: 'asc' },
  })

  return sites
})
