/**
 * JSON-LD Structured Data Component
 *
 * Renders Schema.org structured data in a script tag.
 * This is a reusable component for all JSON-LD schema types.
 */

import type { Thing, WithContext } from 'schema-dts';

interface JsonLdProps<T extends Thing> {
  /** The structured data to render */
  data: WithContext<T>;
}

/**
 * Renders JSON-LD structured data in a script tag.
 *
 * @example
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "Product",
 *   name: "Example Product",
 * }} />
 */
export function JsonLd<T extends Thing>({ data }: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}
