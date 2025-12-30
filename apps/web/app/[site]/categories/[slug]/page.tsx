import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getSiteBySlug,
  getCategories,
  getProductsByCategory,
} from '@affiliate/api';
import { ProductGrid, ProductFilters, type SortOption } from '@affiliate/ui/products';
import { CategoryGrid } from '@affiliate/ui/categories';
import { AffiliateDisclosure } from '@affiliate/ui/affiliate';
import { CategoryJsonLd, BreadcrumbJsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import type { Metadata } from 'next';
import type { CategoryCardData } from '@affiliate/ui/categories';

interface CategoryPageProps {
  params: Promise<{
    site: string;
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: SortOption;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { site: siteSlug, slug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Category Not Found' };
  }

  // Get all categories and find the one matching the slug
  const categories = await getCategories(site.id);
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title = category.seoTitle || `${category.name} | ${site.name}`;
  const description =
    category.seoDescription || category.description || `Browse ${category.name} products on ${site.name}`;
  const canonicalUrl = buildCanonicalUrl(site, `/categories/${slug}`);
  const twitterHandle = getTwitterHandle(site.social as Record<string, unknown> | null);

  return {
    title,
    description,
    keywords: category.seoKeywords?.length ? category.seoKeywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description || undefined,
      url: canonicalUrl,
      siteName: site.name,
      type: 'website',
      images: category.featuredImage
        ? [{ url: category.featuredImage, width: 1200, height: 630, alt: category.name }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description || undefined,
      images: category.featuredImage ? [category.featuredImage] : undefined,
      ...(twitterHandle && { site: twitterHandle }),
    },
  };
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: URLSearchParams;
}

function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  }

  // Build URL with existing params
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border px-3 py-2 text-sm opacity-50">
          Previous
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page as number)}
              className={`rounded-md px-3 py-2 text-sm ${
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted'
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border px-3 py-2 text-sm opacity-50">
          Next
        </span>
      )}
    </nav>
  );
}

async function CategoryProducts({
  siteId,
  siteSlug,
  categoryId,
  categorySlug,
  page,
  sort,
}: {
  siteId: string;
  siteSlug: string;
  categoryId: string;
  categorySlug: string;
  page: number;
  sort: SortOption;
}) {
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  // Note: sort is handled client-side currently; API sorting can be added in the future
  void sort; // Acknowledge the parameter is available for future use

  const response = await getProductsByCategory(siteId, categoryId, pageSize, offset);

  const totalPages = Math.ceil(response.total / pageSize);

  if (response.products.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-semibold text-muted-foreground">
          No products found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back later for new products in this category.
        </p>
      </div>
    );
  }

  // Build search params for pagination
  const searchParams = new URLSearchParams();
  if (sort !== 'featured') {
    searchParams.set('sort', sort);
  }

  return (
    <>
      <ProductGrid products={response.products} siteSlug={siteSlug} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/${siteSlug}/categories/${categorySlug}`}
        searchParams={searchParams}
      />
    </>
  );
}

function ProductsLoading() {
  return (
    <ProductGrid products={[]} siteSlug="" isLoading={true} skeletonCount={12} />
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { site: siteSlug, slug } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const sort: SortOption = sortParam || 'featured';

  const site = await getSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  // Get all categories and find the one matching the slug
  const allCategories = await getCategories(site.id);
  const category = allCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Get child categories (subcategories of this category)
  const childCategories = allCategories.filter((c) => c.parentId === category.id);
  const childCategoryCards: CategoryCardData[] = childCategories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    categoryType: cat.categoryType,
    description: cat.description,
    icon: cat.icon,
    featuredImage: cat.featuredImage,
  }));

  // Get parent category if exists
  const parentCategory = category.parentId
    ? allCategories.find((c) => c.id === category.parentId)
    : null;

  // Build canonical URL and breadcrumb data for JSON-LD
  const canonicalUrl = buildCanonicalUrl(site, `/categories/${slug}`);
  const baseUrl = buildCanonicalUrl(site, '');

  // Build breadcrumb items for JSON-LD
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Categories', url: `${baseUrl}/categories` },
    ...(parentCategory
      ? [{ name: parentCategory.name, url: `${baseUrl}/categories/${parentCategory.slug}` }]
      : []),
    { name: category.name, url: canonicalUrl },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <CategoryJsonLd
        name={category.name}
        description={category.description}
        url={canonicalUrl}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container-wide section-padding py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href={`/${siteSlug}`} className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </li>
          <li className="text-muted-foreground">/</li>
          <li>
            <Link href={`/${siteSlug}/categories`} className="text-muted-foreground hover:text-foreground">
              Categories
            </Link>
          </li>
          {parentCategory && (
            <>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link
                  href={`/${siteSlug}/categories/${parentCategory.slug}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {parentCategory.name}
                </Link>
              </li>
            </>
          )}
          <li className="text-muted-foreground">/</li>
          <li className="font-medium">{category.name}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Category Image */}
          {category.featuredImage && (
            <div className="relative h-48 w-full overflow-hidden rounded-xl md:h-40 md:w-40 md:flex-shrink-0">
              <Image
                src={category.featuredImage}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 160px"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Icon */}
              {category.icon && !category.featuredImage && (
                <span className="text-4xl">{category.icon}</span>
              )}
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {category.name}
              </h1>
            </div>

            {category.description && (
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Category Content */}
      {category.content && (
        <div
          className="prose mb-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: category.content }}
        />
      )}

      {/* Subcategories */}
      {childCategoryCards.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Browse Subcategories</h2>
          <CategoryGrid categories={childCategoryCards} siteSlug={siteSlug} />
        </section>
      )}

      {/* Affiliate Disclosure */}
      <AffiliateDisclosure className="mb-6" variant="compact" />

      {/* Products Section with Filters */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Products in {category.name}</h2>
        </div>

        {/* Filters */}
        <ProductFilters
          currentSort={sort}
          showCategoryFilter={false}
          className="mb-6"
        />

        {/* Products Grid */}
          <Suspense fallback={<ProductsLoading />}>
            <CategoryProducts
              siteId={site.id}
              siteSlug={siteSlug}
              categoryId={category.id}
              categorySlug={slug}
              page={page}
              sort={sort}
            />
          </Suspense>
        </section>
      </div>
    </>
  );
}
