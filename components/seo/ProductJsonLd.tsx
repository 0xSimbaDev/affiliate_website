/**
 * Product JSON-LD Structured Data Component
 *
 * Renders Schema.org Product structured data for product pages.
 * Includes offers, ratings, and reviews.
 */

import { JsonLd } from './JsonLd';
import type { Product, AggregateRating, Offer, WithContext } from 'schema-dts';

interface ProductJsonLdProps {
  /** Product name/title */
  name: string;
  /** Product description */
  description?: string | null;
  /** Product image URL(s) */
  image?: string | string[] | null;
  /** Product URL on this site */
  url: string;
  /** SKU or product identifier */
  sku?: string;
  /** Brand name */
  brand?: string;
  /** Price information */
  price?: {
    amount: number | null;
    currency?: string | null;
    priceValidUntil?: string;
  };
  /** Rating information */
  rating?: {
    value: number | null;
    reviewCount?: number | null;
    bestRating?: number;
    worstRating?: number;
  };
  /** Affiliate URL (offers URL) */
  affiliateUrl?: string | null;
  /** Product availability */
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'SoldOut';
  /** Product condition */
  condition?: 'NewCondition' | 'RefurbishedCondition' | 'UsedCondition';
}

/**
 * Renders Schema.org Product structured data.
 *
 * @see https://schema.org/Product
 * @see https://developers.google.com/search/docs/appearance/structured-data/product
 *
 * @example
 * <ProductJsonLd
 *   name="Sony WH-1000XM4"
 *   description="Wireless noise-canceling headphones"
 *   image="/images/sony-headphones.jpg"
 *   url="https://example.com/products/sony-wh-1000xm4"
 *   price={{ amount: 349.99, currency: "USD" }}
 *   rating={{ value: 4.8, reviewCount: 1250 }}
 *   affiliateUrl="https://amazon.com/dp/..."
 * />
 */
export function ProductJsonLd({
  name,
  description,
  image,
  url,
  sku,
  brand,
  price,
  rating,
  affiliateUrl,
  availability = 'InStock',
  condition = 'NewCondition',
}: ProductJsonLdProps) {
  // Build aggregate rating if rating data is available
  const aggregateRating: AggregateRating | undefined =
    rating?.value !== null && rating?.value !== undefined
      ? {
          '@type': 'AggregateRating',
          ratingValue: rating.value,
          bestRating: rating.bestRating || 5,
          worstRating: rating.worstRating || 1,
          ...(rating.reviewCount !== null &&
            rating.reviewCount !== undefined && {
              reviewCount: rating.reviewCount,
            }),
        }
      : undefined;

  // Build offers if price data is available
  const offers: Offer | undefined =
    price?.amount !== null && price?.amount !== undefined
      ? {
          '@type': 'Offer',
          price: price.amount,
          priceCurrency: price.currency || 'USD',
          availability: `https://schema.org/${availability}`,
          itemCondition: `https://schema.org/${condition}`,
          ...(affiliateUrl && { url: affiliateUrl }),
          ...(price.priceValidUntil && { priceValidUntil: price.priceValidUntil }),
        }
      : undefined;

  // Build image array
  const imageArray = image
    ? Array.isArray(image)
      ? image
      : [image]
    : undefined;

  const data: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
    ...(description && { description }),
    ...(imageArray && { image: imageArray }),
    ...(sku && { sku }),
    ...(brand && { brand: { '@type': 'Brand', name: brand } }),
    ...(aggregateRating && { aggregateRating }),
    ...(offers && { offers }),
  };

  return <JsonLd data={data} />;
}
