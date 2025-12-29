/**
 * Dynamic Robots.txt Generation
 *
 * Generates a robots.txt for all sites.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Get all active site domains for sitemaps
  let sitemapUrls: string[] = [];

  try {
    const sites = await prisma.site.findMany({
      where: { isActive: true },
      select: { domain: true },
    });

    sitemapUrls = sites.map((site) => `https://${site.domain}/sitemap.xml`);
  } catch (error) {
    console.error('Error fetching sites for robots.txt:', error);
    // Fallback to main sitemap
    sitemapUrls = ['/sitemap.xml'];
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '*.json$',
          '/private/',
        ],
      },
      // Block AI/ML crawlers if desired (optional)
      // {
      //   userAgent: 'GPTBot',
      //   disallow: '/',
      // },
    ],
    sitemap: sitemapUrls.length === 1 ? sitemapUrls[0] : sitemapUrls,
    host: sitemapUrls.length > 0 ? sitemapUrls[0].replace('/sitemap.xml', '') : undefined,
  };
}
