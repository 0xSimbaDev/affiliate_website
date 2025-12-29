import * as React from 'react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { ProductCardData } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface ProductGridProps {
  products: ProductCardData[];
  siteSlug: string;
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

/**
 * ProductCardSkeleton - Loading placeholder for product cards
 */
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <CardHeader className="pb-2">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        {/* Excerpt skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Rating skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        {/* Price skeleton */}
        <Skeleton className="h-6 w-20" />
      </CardFooter>
    </Card>
  );
}

/**
 * ProductGrid - Responsive grid layout for displaying product cards
 *
 * Responsive breakpoints:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (1024px - 1280px): 3 columns
 * - Large Desktop (>= 1280px): 4 columns
 */
export function ProductGrid({
  products,
  siteSlug,
  isLoading = false,
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
      >
        {[...Array(skeletonCount)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-semibold text-muted-foreground">
          No products found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back later for new products.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          siteSlug={siteSlug}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
