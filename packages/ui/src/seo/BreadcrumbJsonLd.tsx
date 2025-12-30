/**
 * Breadcrumb JSON-LD Structured Data Component
 *
 * Renders Schema.org BreadcrumbList structured data for navigation.
 */

import { JsonLd } from './JsonLd';
import type { BreadcrumbList, WithContext, ListItem } from 'schema-dts';

interface BreadcrumbItem {
  /** Breadcrumb label/name */
  name: string;
  /** Full URL for the breadcrumb item */
  url: string;
}

interface BreadcrumbJsonLdProps {
  /** Array of breadcrumb items in order */
  items: BreadcrumbItem[];
}

/**
 * Renders Schema.org BreadcrumbList structured data.
 *
 * @see https://schema.org/BreadcrumbList
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 *
 * @example
 * <BreadcrumbJsonLd
 *   items={[
 *     { name: "Home", url: "https://example.com" },
 *     { name: "Products", url: "https://example.com/products" },
 *     { name: "Headphones", url: "https://example.com/products/headphones" },
 *   ]}
 * />
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  if (items.length === 0) return null;

  const data: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(
      (item, index): ListItem => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })
    ),
  };

  return <JsonLd data={data} />;
}
