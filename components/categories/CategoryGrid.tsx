import * as React from 'react';
import { CategoryCard, type CategoryCardData } from './CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface CategoryGridProps {
  categories: CategoryCardData[];
  siteSlug: string;
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

/**
 * CategoryCardSkeleton - Loading placeholder for category cards
 */
function CategoryCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {/* Icon skeleton */}
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />

        <div className="flex-1 space-y-2">
          {/* Name skeleton */}
          <Skeleton className="h-5 w-2/3" />
          {/* Description skeleton */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          {/* Count skeleton */}
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Arrow skeleton */}
        <Skeleton className="h-5 w-5 flex-shrink-0" />
      </div>
    </Card>
  );
}

/**
 * CategoryGrid - Grid layout for displaying category cards
 *
 * Responsive breakpoints:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (>= 1024px): 3 columns
 */
export function CategoryGrid({
  categories,
  siteSlug,
  isLoading = false,
  skeletonCount = 6,
  className,
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {[...Array(skeletonCount)].map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="mb-4 h-12 w-12 text-muted-foreground/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-lg font-semibold text-muted-foreground">
          No categories found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back later for categories.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          siteSlug={siteSlug}
        />
      ))}
    </div>
  );
}

export default CategoryGrid;
