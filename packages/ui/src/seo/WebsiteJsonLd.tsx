/**
 * Website JSON-LD Structured Data Component
 *
 * Renders Schema.org WebSite structured data for the homepage.
 * Includes SearchAction for sitelinks search box.
 */

interface WebsiteJsonLdProps {
  /** Site name */
  name: string;
  /** Site URL (base domain) */
  url: string;
  /** Site description */
  description?: string | null;
  /** Search URL template (use {search_term_string} as placeholder) */
  searchUrl?: string;
  /** Alternate names for the site */
  alternateName?: string[];
  /** Site logo URL */
  logo?: string;
}

// Custom type for WebSite JSON-LD that includes query-input (not in schema-dts)
interface WebSiteJsonLd {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  alternateName?: string[];
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

/**
 * Renders Schema.org WebSite structured data.
 *
 * @see https://schema.org/WebSite
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 *
 * @example
 * <WebsiteJsonLd
 *   name="TechFlow"
 *   url="https://techflow.com"
 *   description="Expert tech reviews and buying guides"
 *   searchUrl="https://techflow.com/search?q={search_term_string}"
 * />
 */
export function WebsiteJsonLd({
  name,
  url,
  description,
  searchUrl,
  alternateName,
  logo,
}: WebsiteJsonLdProps) {
  const data: WebSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(description && { description }),
    ...(alternateName && { alternateName }),
    ...(logo && {
      publisher: {
        '@type': 'Organization' as const,
        name,
        logo: {
          '@type': 'ImageObject' as const,
          url: logo,
        },
      },
    }),
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction' as const,
        target: {
          '@type': 'EntryPoint' as const,
          urlTemplate: searchUrl,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}
