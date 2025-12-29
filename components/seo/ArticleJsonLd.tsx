/**
 * Article JSON-LD Structured Data Component
 *
 * Renders Schema.org Article/Review structured data for article pages.
 * Supports different article types: Review, Article, HowTo, etc.
 */

import { JsonLd } from './JsonLd';
import type { Article, Review, HowTo, ItemList, WithContext, ListItem } from 'schema-dts';

type ArticleSchemaType = 'Article' | 'Review' | 'HowTo' | 'ItemList';

interface ArticleJsonLdProps {
  /** Schema type based on article type */
  schemaType?: ArticleSchemaType;
  /** Article headline/title */
  headline: string;
  /** Article description/excerpt */
  description?: string | null;
  /** Featured image URL */
  image?: string | null;
  /** Author name */
  author?: string | null;
  /** Publisher name */
  publisher: string;
  /** Publisher logo URL */
  publisherLogo?: string;
  /** Article URL */
  url: string;
  /** Date published (ISO 8601) */
  datePublished?: string | null;
  /** Date modified (ISO 8601) */
  dateModified?: string;
  /** Reviewed item (for Review type) */
  reviewedItem?: {
    name: string;
    description?: string;
    image?: string;
  };
  /** Rating (for Review type) */
  rating?: {
    value: number;
    bestRating?: number;
    worstRating?: number;
  };
  /** Products in the article (for roundups/ItemList) */
  products?: Array<{
    name: string;
    url: string;
    position: number;
    image?: string;
    description?: string;
  }>;
}

/**
 * Renders Schema.org Article/Review structured data.
 *
 * @see https://schema.org/Article
 * @see https://schema.org/Review
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 * @see https://developers.google.com/search/docs/appearance/structured-data/review
 *
 * @example
 * <ArticleJsonLd
 *   schemaType="Review"
 *   headline="Sony WH-1000XM4 Review"
 *   description="Our in-depth review of the Sony WH-1000XM4"
 *   author="John Doe"
 *   publisher="TechFlow"
 *   url="https://example.com/reviews/sony-wh-1000xm4-review"
 *   datePublished="2024-01-15T10:00:00Z"
 *   reviewedItem={{ name: "Sony WH-1000XM4" }}
 *   rating={{ value: 4.5 }}
 * />
 */
export function ArticleJsonLd({
  schemaType = 'Article',
  headline,
  description,
  image,
  author,
  publisher,
  publisherLogo,
  url,
  datePublished,
  dateModified,
  reviewedItem,
  rating,
  products,
}: ArticleJsonLdProps) {
  // Build publisher object
  const publisherObj = {
    '@type': 'Organization' as const,
    name: publisher,
    ...(publisherLogo && {
      logo: {
        '@type': 'ImageObject' as const,
        url: publisherLogo,
      },
    }),
  };

  // Build author object
  const authorObj = author
    ? {
        '@type': 'Person' as const,
        name: author,
      }
    : undefined;

  // For ItemList (roundups), render a list of products
  if (schemaType === 'ItemList' && products && products.length > 0) {
    const itemListData: WithContext<ItemList> = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: headline,
      ...(description && { description }),
      numberOfItems: products.length,
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

    return <JsonLd data={itemListData} />;
  }

  // For Review type
  if (schemaType === 'Review') {
    const reviewData: WithContext<Review> = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      headline,
      url,
      ...(description && { description }),
      ...(image && { image }),
      ...(authorObj && { author: authorObj }),
      publisher: publisherObj,
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
      ...(reviewedItem && {
        itemReviewed: {
          '@type': 'Product',
          name: reviewedItem.name,
          ...(reviewedItem.description && { description: reviewedItem.description }),
          ...(reviewedItem.image && { image: reviewedItem.image }),
        },
      }),
      ...(rating && {
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating.value,
          bestRating: rating.bestRating || 5,
          worstRating: rating.worstRating || 1,
        },
      }),
    };

    return <JsonLd data={reviewData} />;
  }

  // For HowTo type
  if (schemaType === 'HowTo') {
    const howToData: WithContext<HowTo> = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: headline,
      ...(description && { description }),
      ...(image && { image }),
      ...(authorObj && { author: authorObj }),
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
    };

    return <JsonLd data={howToData} />;
  }

  // Default: Article type
  const articleData: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    url,
    ...(description && { description }),
    ...(image && { image }),
    ...(authorObj && { author: authorObj }),
    publisher: publisherObj,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
  };

  return <JsonLd data={articleData} />;
}
