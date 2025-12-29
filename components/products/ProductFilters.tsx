'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'featured';

interface ProductFiltersProps {
  /** Categories for filtering */
  categories?: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  /** Currently selected category slug */
  selectedCategory?: string;
  /** Currently selected sort option */
  currentSort?: SortOption;
  /** Show category filter */
  showCategoryFilter?: boolean;
  /** Total product count for display */
  totalProducts?: number;
  /** Custom class name */
  className?: string;
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

/**
 * Product Filters Component
 *
 * Provides sorting and category filtering for product listings.
 * Uses URL search params for server-side filtering.
 */
export function ProductFilters({
  categories = [],
  selectedCategory,
  currentSort = 'featured',
  showCategoryFilter = true,
  totalProducts,
  className,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /**
   * Create new URL with updated search params
   */
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      if (!updates.page) {
        params.delete('page');
      }

      return params.toString();
    },
    [searchParams]
  );

  /**
   * Handle sort change
   */
  const handleSortChange = (sort: SortOption) => {
    startTransition(() => {
      const queryString = createQueryString({ sort });
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    });
  };

  /**
   * Handle category change
   */
  const handleCategoryChange = (categorySlug: string | null) => {
    startTransition(() => {
      const queryString = createQueryString({ category: categorySlug });
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    });
    setMobileFiltersOpen(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Results count and category filter */}
        <div className="flex items-center gap-4">
          {totalProducts !== undefined && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{totalProducts}</span> products
            </p>
          )}

          {/* Category Pills - Desktop */}
          {showCategoryFilter && categories.length > 0 && (
            <div className="hidden flex-wrap gap-2 md:flex">
              <button
                onClick={() => handleCategoryChange(null)}
                disabled={isPending}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  !selectedCategory
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                All
              </button>
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  disabled={isPending}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    selectedCategory === category.slug
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  )}
                >
                  {category.name}
                </button>
              ))}
              {categories.length > 5 && (
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                >
                  +{categories.length - 5} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Sort dropdown and mobile filter button */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          {showCategoryFilter && categories.length > 0 && (
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium md:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
              {selectedCategory && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
                  1
                </span>
              )}
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select
              id="sort"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              disabled={isPending}
              className={cn(
                'appearance-none rounded-lg border border-border bg-background px-4 py-2 pr-10 text-sm font-medium',
                'focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] focus:ring-offset-2',
                isPending && 'opacity-50'
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </div>
      )}

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filter by Category</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left',
                  !selectedCategory ? 'bg-foreground text-background' : 'bg-muted hover:bg-muted/80'
                )}
              >
                <span className="font-medium">All Categories</span>
                {!selectedCategory && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left',
                    selectedCategory === category.slug
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  <span className="font-medium">{category.name}</span>
                  {selectedCategory === category.slug && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductFilters;
