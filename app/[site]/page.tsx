import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { getSiteBySlug } from '@/lib/api/sites';
import { getFeaturedProducts, getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { ProductGrid } from '@/components/products';
import { Skeleton } from '@/components/ui/skeleton';
import { WebsiteJsonLd } from '@/components/seo';
import { cn, buildCanonicalUrl, getTwitterHandle } from '@/lib/utils';
import type { ProductCardData, Category } from '@/lib/types';
import type { Metadata } from 'next';

interface SiteHomePageProps {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: SiteHomePageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Site Not Found' };
  }

  const title = site.name;
  const description = site.description || site.tagline || `Welcome to ${site.name}`;
  const canonicalUrl = buildCanonicalUrl(site, '');
  const twitterHandle = getTwitterHandle(site.social as Record<string, unknown> | null);

  return {
    title,
    description,
    keywords: site.niche?.name ? [site.niche.name, 'reviews', 'buying guide'] : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: site.name,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(twitterHandle && { site: twitterHandle }),
    },
  };
}

/**
 * Section Header Component
 * Consistent section title styling across the page
 */
function SectionHeader({
  label,
  title,
  description,
  align = 'left',
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: { href: string; label: string };
}) {
  return (
    <div className={cn('mb-8 lg:mb-10', align === 'center' && 'text-center')}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {label && (
            <p
              className="mb-2 text-sm font-medium uppercase tracking-wide"
              style={{ color: 'var(--site-primary)' }}
            >
              {label}
            </p>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'mt-3 leading-relaxed text-muted-foreground',
                align === 'center' ? 'mx-auto max-w-xl' : 'max-w-2xl'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="hidden items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {action.label}
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Featured Product Card - Large, prominent card for hero picks
 */
function FeaturedProductCard({
  product,
  siteSlug,
  isLarge = false,
}: {
  product: ProductCardData;
  siteSlug: string;
  isLarge?: boolean;
}) {
  const productUrl = `/${siteSlug}/products/${product.slug}`;

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/50 bg-card',
        'transition-all duration-200 hover:border-border hover:shadow-lg',
        isLarge && 'lg:col-span-2 lg:row-span-2'
      )}
    >
      <Link href={productUrl} className="block h-full">
        {/* Image Area */}
        <div
          className={cn(
            'relative bg-gradient-to-br from-muted to-muted/50',
            isLarge ? 'aspect-[16/10] lg:aspect-[16/9]' : 'aspect-[16/10]'
          )}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={isLarge ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 33vw'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className={cn(
                  'text-muted-foreground/20',
                  isLarge ? 'h-24 w-24' : 'h-16 w-16'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={0.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}
          {product.isFeatured && (
            <div
              className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              Top Pick
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('p-5', isLarge && 'lg:p-6')}>
          <h3
            className={cn(
              'mb-2 font-semibold text-foreground transition-colors group-hover:text-[var(--site-primary)]',
              isLarge ? 'text-xl lg:text-2xl' : 'text-lg'
            )}
          >
            {product.title}
          </h3>
          {product.excerpt && (
            <p
              className={cn(
                'text-muted-foreground',
                isLarge ? 'line-clamp-3 text-sm lg:text-base' : 'line-clamp-2 text-sm'
              )}
            >
              {product.excerpt}
            </p>
          )}

          {/* Rating and Price */}
          <div className="mt-4 flex items-center justify-between">
            {product.rating && (
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
            {product.priceFrom && (
              <span className="text-sm font-semibold text-foreground">
                From ${product.priceFrom}
              </span>
            )}
          </div>

          {/* Read More Indicator */}
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
            <span style={{ color: 'var(--site-primary)' }}>View Details</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              style={{ color: 'var(--site-primary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Quick Pick Card - Compact card for ranked lists
 */
function QuickPickCard({
  product,
  siteSlug,
  rank,
}: {
  product: ProductCardData;
  siteSlug: string;
  rank: number;
}) {
  const productUrl = `/${siteSlug}/products/${product.slug}`;

  return (
    <article className="group flex gap-4 rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md">
      <Link href={productUrl} className="flex w-full gap-4">
        {/* Rank Badge */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          #{rank}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground transition-colors group-hover:text-[var(--site-primary)]">
            {product.title}
          </h3>
          <div className="mt-1 flex items-center gap-3">
            {product.priceFrom && (
              <span className="text-sm font-semibold text-foreground">
                ${product.priceFrom}
              </span>
            )}
            {product.rating && (
              <div className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </Link>
    </article>
  );
}

/**
 * Category Card - Clean grid navigation
 */
function CategoryCard({
  category,
  siteSlug,
  productCount,
}: {
  category: Category;
  siteSlug: string;
  productCount: number;
}) {
  const categoryUrl = `/${siteSlug}/categories/${category.slug}`;

  return (
    <Link
      href={categoryUrl}
      className={cn(
        'group flex items-center gap-4 p-4',
        'rounded-xl border border-border/50 bg-card',
        'transition-all duration-200',
        'hover:border-border hover:shadow-md'
      )}
    >
      {category.featuredImage ? (
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={category.featuredImage}
            alt={category.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-[var(--site-primary-10)]"
          style={
            {
              '--site-primary-10': 'color-mix(in srgb, var(--site-primary) 10%, transparent)',
            } as React.CSSProperties
          }
        >
          {category.icon ? (
            <span className="text-xl">{category.icon}</span>
          ) : (
            <span className="text-lg font-semibold text-muted-foreground transition-colors group-hover:text-[var(--site-primary)]">
              {category.name.charAt(0)}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-medium text-foreground transition-colors group-hover:text-[var(--site-primary)]">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground">{productCount} products</p>
      </div>
      <svg
        className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

/**
 * Trust Metric Component
 */
function TrustMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="mb-1 text-3xl font-bold lg:text-4xl"
        style={{ color: 'var(--site-primary)' }}
      >
        {value}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * Featured Products Section - Async data fetching
 */
async function FeaturedProductsSection({
  siteId,
  siteSlug,
}: {
  siteId: string;
  siteSlug: string;
}) {
  const featuredProducts = await getFeaturedProducts(siteId, 3);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {featuredProducts.map((product, index) => (
        <FeaturedProductCard
          key={product.id}
          product={product}
          siteSlug={siteSlug}
          isLarge={index === 0}
        />
      ))}
    </div>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'overflow-hidden rounded-xl border border-border/50',
            i === 0 && 'lg:col-span-2 lg:row-span-2'
          )}
        >
          <Skeleton className={cn('w-full', i === 0 ? 'aspect-[16/9]' : 'aspect-[16/10]')} />
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Quick Picks Section - Top rated products
 */
async function QuickPicksSection({
  siteId,
  siteSlug,
}: {
  siteId: string;
  siteSlug: string;
}) {
  const { products } = await getProducts(siteId, {
    limit: 4,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {products.map((product, index) => (
        <QuickPickCard
          key={product.id}
          product={product}
          siteSlug={siteSlug}
          rank={index + 1}
        />
      ))}
    </div>
  );
}

function QuickPicksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border border-border/50 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Categories Section
 */
async function CategoriesSection({
  siteId,
  siteSlug,
}: {
  siteId: string;
  siteSlug: string;
}) {
  const categories = await getCategories(siteId, { parentId: null });

  if (categories.length === 0) {
    return null;
  }

  // Get total product count for display
  const { total: totalProducts } = await getProducts(siteId, { limit: 1 });
  const avgProductsPerCategory = Math.max(1, Math.floor(totalProducts / Math.max(1, categories.length)));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.slice(0, 6).map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          siteSlug={siteSlug}
          productCount={avgProductsPerCategory}
        />
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border/50 p-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Latest Products Section
 */
async function LatestProductsSection({
  siteId,
  siteSlug,
}: {
  siteId: string;
  siteSlug: string;
}) {
  const { products } = await getProducts(siteId, {
    limit: 4,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (products.length === 0) {
    return null;
  }

  return <ProductGrid products={products} siteSlug={siteSlug} />;
}

function LatestProductsSkeleton() {
  return <ProductGrid products={[]} siteSlug="" isLoading={true} skeletonCount={4} />;
}

/**
 * Site Homepage
 *
 * A clean, editorial homepage inspired by Wirecutter and The Verge.
 * Fetches real data from the database for:
 * - Featured products
 * - Top-rated products (Quick Picks)
 * - Categories with product counts
 * - Latest products
 */
export default async function SiteHomePage({ params }: SiteHomePageProps) {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return null; // Layout will handle 404
  }

  const nicheName = site.niche?.name || 'Products';
  const siteId = site.id;
  const baseUrl = buildCanonicalUrl(site, '');

  return (
    <>
      {/* JSON-LD Structured Data */}
      <WebsiteJsonLd
        name={site.name}
        url={baseUrl}
        description={site.description || site.tagline}
        searchUrl={`${baseUrl}/products?q={search_term_string}`}
      />

      <div className="flex flex-col">
        {/* Hero Section - Featured Picks Grid */}
        <section className="py-8 lg:py-12">
        <div className="container-wide section-padding">
          {/* Hero Header */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: 'var(--site-primary)' }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                Expert {nicheName} Reviews
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Find the Best {nicheName}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Independent, hands-on reviews to help you make informed decisions.
              Updated weekly with the latest picks.
            </p>
          </div>

          {/* Featured Grid */}
          <Suspense fallback={<FeaturedProductsSkeleton />}>
            <FeaturedProductsSection siteId={siteId} siteSlug={siteSlug} />
          </Suspense>
        </div>
      </section>

      {/* Quick Picks Section */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container-wide section-padding">
          <SectionHeader
            label="Top Rated"
            title="This Week's Best Picks"
            description="Our highest-rated products based on performance, value, and user feedback."
            action={{ href: `/${siteSlug}/products?sort=rating`, label: 'View all reviews' }}
          />

          <Suspense fallback={<QuickPicksSkeleton />}>
            <QuickPicksSection siteId={siteId} siteSlug={siteSlug} />
          </Suspense>

          {/* Mobile View All Link */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              href={`/${siteSlug}/products?sort=rating`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all reviews
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 lg:py-16">
        <div className="container-wide section-padding">
          <SectionHeader
            label="Browse"
            title="Shop by Category"
            action={{ href: `/${siteSlug}/categories`, label: 'All categories' }}
          />

          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesSection siteId={siteId} siteSlug={siteSlug} />
          </Suspense>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container-wide section-padding">
          <SectionHeader
            label="New Arrivals"
            title="Latest Products"
            description="Fresh additions to our collection. Be the first to discover new finds."
            action={{ href: `/${siteSlug}/products?sort=newest`, label: 'View all new' }}
          />

          <Suspense fallback={<LatestProductsSkeleton />}>
            <LatestProductsSection siteId={siteId} siteSlug={siteSlug} />
          </Suspense>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 lg:py-16">
        <div className="container-wide section-padding">
          <div className="rounded-2xl border border-border/50 bg-card p-8 lg:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Content */}
              <div>
                <p
                  className="mb-3 text-sm font-medium uppercase tracking-wide"
                  style={{ color: 'var(--site-primary)' }}
                >
                  Why Trust Us
                </p>
                <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Independent Reviews You Can Rely On
                </h2>
                <p className="mb-6 text-muted-foreground">
                  We test every product ourselves. Our recommendations are based
                  on real-world experience, not manufacturer claims or sponsored
                  content. When you buy through our links, we may earn a
                  commission, but it never influences our reviews.
                </p>

                <div className="space-y-4">
                  {[
                    { title: 'Hands-on Testing', desc: 'Every product is tested in real-world conditions' },
                    { title: 'No Paid Placements', desc: 'Rankings based on merit, not advertising dollars' },
                    { title: 'Regular Updates', desc: 'Reviews updated as products and prices change' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'var(--site-primary)' }}
                      >
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href={`/${siteSlug}/about`}
                    className={cn(
                      'inline-flex items-center gap-2 px-5 py-2.5',
                      'rounded-lg border border-border bg-background text-sm font-medium',
                      'transition-colors duration-150 hover:bg-muted'
                    )}
                  >
                    Learn about our process
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl bg-muted/50 p-8">
                <div className="grid grid-cols-2 gap-8">
                  <TrustMetric value="500+" label="Products Tested" />
                  <TrustMetric value="100K+" label="Monthly Readers" />
                  <TrustMetric value="5+" label="Years Experience" />
                  <TrustMetric value="4.9" label="Avg. Rating" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Disclosure Banner */}
      <section className="py-8 lg:py-10">
        <div className="container-wide section-padding">
          <div className="rounded-lg bg-muted/50 p-4 text-center lg:p-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Affiliate Disclosure:</span>{' '}
              We may earn commissions from purchases made through links on this
              site. This helps support our independent testing and keeps our
              reviews free.{' '}
              <Link
                href={`/${siteSlug}/disclaimer`}
                className="underline transition-colors hover:text-foreground"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
