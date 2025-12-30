import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBySlug, getProducts, getCategories } from '@affiliate/api';
import { ProductGrid, ProductFilters, type SortOption } from '@affiliate/ui/products';
import { AffiliateDisclosure } from '@affiliate/ui/affiliate';
import { BreadcrumbJsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import type { Metadata } from 'next';

interface ProductsPageProps {
  params: Promise<{
    site: string;
  }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: SortOption;
  }>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Products' };
  }

  const title = `Products | ${site.name}`;
  const description = `Browse all products available on ${site.name}. Find the best deals and recommendations.`;
  const canonicalUrl = buildCanonicalUrl(site, '/products');
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
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
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

    // Always show last page
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
      {/* Previous Button */}
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

      {/* Page Numbers */}
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

      {/* Next Button */}
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

async function ProductsContent({
  siteId,
  siteSlug,
  page,
  categorySlug,
  sort,
  categories,
}: {
  siteId: string;
  siteSlug: string;
  page: number;
  categorySlug?: string;
  sort: SortOption;
  categories: Array<{ id: string; slug: string; name: string }>;
}) {
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  // Find category ID from slug
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  // Map sort option to API params
  let sortBy: 'createdAt' | 'updatedAt' | 'title' | 'sortOrder' | 'rating' = 'sortOrder';
  let sortOrder: 'asc' | 'desc' = 'asc';

  switch (sort) {
    case 'newest':
      sortBy = 'createdAt';
      sortOrder = 'desc';
      break;
    case 'price-asc':
      sortBy = 'sortOrder'; // TODO: Add price sorting to API
      sortOrder = 'asc';
      break;
    case 'price-desc':
      sortBy = 'sortOrder'; // TODO: Add price sorting to API
      sortOrder = 'desc';
      break;
    case 'rating':
      sortBy = 'rating';
      sortOrder = 'desc';
      break;
    case 'featured':
    default:
      sortBy = 'sortOrder';
      sortOrder = 'asc';
      break;
  }

  const response = await getProducts(siteId, {
    limit: pageSize,
    offset,
    categoryId: selectedCategory?.id,
    sortBy,
    sortOrder,
  });

  const totalPages = Math.ceil(response.total / pageSize);

  // Build search params for pagination
  const searchParams = new URLSearchParams();
  if (categorySlug) {
    searchParams.set('category', categorySlug);
  }
  if (sort !== 'featured') {
    searchParams.set('sort', sort);
  }

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
          {categorySlug
            ? 'Try selecting a different category or clearing filters.'
            : 'Check back later for new products.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <ProductGrid products={response.products} siteSlug={siteSlug} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/${siteSlug}/products`}
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

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { site: siteSlug } = await params;
  const {
    page: pageParam,
    category: categorySlug,
    sort: sortParam,
  } = await searchParams;

  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const sort: SortOption = sortParam || 'featured';

  const site = await getSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  // Get categories for filtering
  const allCategories = await getCategories(site.id);

  // Get root categories (no parent) for the filter
  const rootCategories = allCategories
    .filter((c) => !c.parentId)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
    }));

  // Find the selected category name for display
  const selectedCategory = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)
    : undefined;

  // Build breadcrumb items for JSON-LD
  const baseUrl = buildCanonicalUrl(site, '');
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Products', url: `${baseUrl}/products` },
    ...(selectedCategory
      ? [{ name: selectedCategory.name, url: `${baseUrl}/products?category=${categorySlug}` }]
      : []),
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
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
          {selectedCategory ? (
            <>
              <li>
                <Link href={`/${siteSlug}/products`} className="text-muted-foreground hover:text-foreground">
                  Products
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="font-medium">{selectedCategory.name}</li>
            </>
          ) : (
            <li className="font-medium">Products</li>
          )}
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {selectedCategory ? selectedCategory.name : 'All Products'}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {selectedCategory
            ? `Browse our curated selection of ${selectedCategory.name.toLowerCase()} products.`
            : 'Discover our curated selection of products and find the perfect match for your needs.'}
        </p>
      </div>

      {/* Affiliate Disclosure */}
      <AffiliateDisclosure className="mb-6" variant="compact" />

      {/* Filters */}
      <ProductFilters
        categories={rootCategories}
        selectedCategory={categorySlug}
        currentSort={sort}
        showCategoryFilter={true}
        className="mb-6"
      />

        {/* Products Grid */}
        <Suspense fallback={<ProductsLoading />}>
          <ProductsContent
            siteId={site.id}
            siteSlug={siteSlug}
            page={page}
            categorySlug={categorySlug}
            sort={sort}
            categories={allCategories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
            }))}
          />
        </Suspense>
      </div>
    </>
  );
}
