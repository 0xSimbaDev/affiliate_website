/**
 * Dynamic Sitemap Generation
 *
 * Generates a sitemap.xml for all sites, products, categories, and articles.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = [];

  try {
    // Get all active sites
    const sites = await prisma.site.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        domain: true,
        updatedAt: true,
      },
    });

    for (const site of sites) {
      const baseUrl = `https://${site.domain}`;

      // Homepage
      entries.push({
        url: baseUrl,
        lastModified: site.updatedAt,
        changeFrequency: 'daily',
        priority: 1.0,
      });

      // Static pages
      entries.push({
        url: `${baseUrl}/products`,
        lastModified: site.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
      });

      entries.push({
        url: `${baseUrl}/categories`,
        lastModified: site.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      entries.push({
        url: `${baseUrl}/reviews`,
        lastModified: site.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
      });

      // Products
      const products = await prisma.product.findMany({
        where: {
          siteId: site.id,
          status: 'PUBLISHED',
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      for (const product of products) {
        entries.push({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Categories
      const categories = await prisma.category.findMany({
        where: {
          siteId: site.id,
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      for (const category of categories) {
        entries.push({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }

      // Articles
      const articles = await prisma.article.findMany({
        where: {
          siteId: site.id,
          status: 'PUBLISHED',
        },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
        },
      });

      for (const article of articles) {
        entries.push({
          url: `${baseUrl}/reviews/${article.slug}`,
          lastModified: article.updatedAt || article.publishedAt || undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least a basic sitemap if database fails
    return [];
  }

  return entries;
}
