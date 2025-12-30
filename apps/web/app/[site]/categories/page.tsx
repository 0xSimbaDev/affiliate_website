import { notFound } from 'next/navigation';
import { getSiteBySlug, getCategories } from '@affiliate/api';
import { CategoryGrid } from '@affiliate/ui/categories';
import { BreadcrumbJsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import type { Metadata } from 'next';
import type { CategoryCardData } from '@affiliate/ui/categories';

interface CategoriesPageProps {
  params: Promise<{
    site: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoriesPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Categories' };
  }

  const title = `Categories | ${site.name}`;
  const description = `Browse all categories on ${site.name}. Find products organized by category.`;
  const canonicalUrl = buildCanonicalUrl(site, '/categories');
  const twitterHandle = getTwitterHandle(site.social as Record<string, unknown> | null);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: site.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(twitterHandle && { site: twitterHandle }),
    },
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { site: siteSlug } = await params;

  const site = await getSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  // Get all categories for this site
  const categories = await getCategories(site.id, {
    parentId: null, // Only root categories for the main listing
  });

  // Transform to CategoryCardData format
  const categoryCards: CategoryCardData[] = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    categoryType: cat.categoryType,
    description: cat.description,
    icon: cat.icon,
    featuredImage: cat.featuredImage,
  }));

  // Build breadcrumb items for JSON-LD
  const baseUrl = buildCanonicalUrl(site, '');
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Categories', url: `${baseUrl}/categories` },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container-wide section-padding py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Categories
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse our categories to find exactly what you are looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <CategoryGrid categories={categoryCards} siteSlug={siteSlug} />
      </div>
    </>
  );
}
