/**
 * Category JSON-LD Structured Data Component
 *
 * Renders Schema.org ItemList or CollectionPage structured data for category pages.
 */

import { JsonLd } from './JsonLd';
import type { ItemList, CollectionPage, WithContext, ListItem } from 'schema-dts';

interface CategoryProduct {
  /** Product name */
  name: string;
  /** Product URL */
  url: string;
  /** Position in the list */
  position: number;
  /** Product image URL */
  image?: string | null;
  /** Product description */
  description?: string | null;
}

interface CategoryJsonLdProps {
  /** Category name */
  name: string;
  /** Category description */
  description?: string | null;
  /** Category URL */
  url: string;
  /** Products in this category */
  products?: CategoryProduct[];
  /** Total number of items (for pagination) */
  numberOfItems?: number;
}

/**
 * Renders Schema.org ItemList/CollectionPage structured data.
 *
 * @see https://schema.org/ItemList
 * @see https://schema.org/CollectionPage
 * @see https://developers.google.com/search/docs/appearance/structured-data/carousel
 *
 * @example
 * <CategoryJsonLd
 *   name="Gaming Headsets"
 *   description="Best gaming headsets for 2024"
 *   url="https://example.com/categories/gaming-headsets"
 *   products={[
 *     { name: "Product 1", url: "...", position: 1 },
 *     { name: "Product 2", url: "...", position: 2 },
 *   ]}
 * />
 */
export function CategoryJsonLd({
  name,
  description,
  url,
  products,
  numberOfItems,
}: CategoryJsonLdProps) {
  // If we have products, render as ItemList
  if (products && products.length > 0) {
    const data: WithContext<ItemList> = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name,
      ...(description && { description }),
      url,
      numberOfItems: numberOfItems || products.length,
      itemListElement: products.map(
        (product): ListItem => ({
          '@type': 'ListItem',
          position: product.position,
          name: product.name,
          url: product.url,
          ...(product.image && { image: product.image }),
          ...(product.description && { description: product.description }),
        })
      ),
    };

    return <JsonLd data={data} />;
  }

  // Otherwise, render as CollectionPage
  const data: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description && { description }),
    url,
    ...(numberOfItems && { mainEntity: { '@type': 'ItemList', numberOfItems } }),
  };

  return <JsonLd data={data} />;
}
