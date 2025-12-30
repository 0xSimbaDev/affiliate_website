import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBySlug } from '@affiliate/api/sites';
import { BreadcrumbJsonLd, JsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import type { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';

interface DisclaimerPageProps {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: DisclaimerPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Disclaimer' };
  }

  const title = `Affiliate Disclaimer | ${site.name}`;
  const description = `Affiliate disclosure and disclaimer for ${site.name}. Learn about our affiliate relationships and how we maintain editorial independence.`;
  const canonicalUrl = buildCanonicalUrl(site, '/disclaimer');
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
      card: 'summary',
      title,
      description,
      ...(twitterHandle && { site: twitterHandle }),
    },
  };
}

/**
 * Disclaimer Section Component
 */
function DisclaimerSection({
  id,
  title,
  children,
  highlight = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-8 rounded-xl border p-6 ${
        highlight
          ? 'border-[var(--site-primary)]/30 bg-[color-mix(in_srgb,var(--site-primary)_5%,transparent)]'
          : 'border-border/50 bg-card'
      }`}
    >
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function DisclaimerPage({ params }: DisclaimerPageProps) {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  const baseUrl = buildCanonicalUrl(site, '');
  const canonicalUrl = buildCanonicalUrl(site, '/disclaimer');
  const domain = site.domain || 'example.com';
  const nicheName = site.niche?.name || 'products';

  // Extract contact email from social
  const social = site.social as { email?: string } | null;
  const contactEmail = social?.email || `contact@${domain}`;

  // Last updated date
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Affiliate Disclaimer', url: canonicalUrl },
  ];

  // JSON-LD structured data
  const webPageJsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Affiliate Disclaimer - ${site.name}`,
    description: `Affiliate disclosure and disclaimer for ${site.name}.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: baseUrl,
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd data={webPageJsonLd} />

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
            <li className="font-medium">Affiliate Disclaimer</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <header className="mb-12">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Affiliate Disclaimer
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </header>

          {/* FTC Disclosure Banner */}
          <div className="mb-8 rounded-xl border-2 border-[var(--site-primary)]/30 bg-[color-mix(in_srgb,var(--site-primary)_10%,transparent)] p-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-foreground">
                  FTC Disclosure Statement
                </h2>
                <p className="text-muted-foreground">
                  In accordance with the Federal Trade Commission (FTC) guidelines, {site.name}{' '}
                  discloses that we may receive compensation from companies whose products we review
                  or recommend. This compensation may be in the form of affiliate commissions,
                  advertising fees, or free products for review purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <DisclaimerSection id="affiliate-disclosure" title="Affiliate Disclosure" highlight>
              <p>
                {site.name} is a participant in various affiliate advertising programs designed to
                provide a means for sites to earn advertising fees by advertising and linking to
                merchant websites.
              </p>
              <p>
                <strong>What this means for you:</strong> When you click on links to various
                merchants on this site and make a purchase, this can result in this site earning a
                commission. Affiliate programs and affiliations include, but are not limited to:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>Amazon Associates Program</li>
                <li>Various brand-specific affiliate programs</li>
                <li>Third-party affiliate networks</li>
              </ul>
              <p>
                The affiliate commission we receive does not affect the price you pay. You will pay
                the same price whether you use our affiliate link or go directly to the vendor
                website.
              </p>
            </DisclaimerSection>

            <DisclaimerSection id="editorial-independence" title="Editorial Independence">
              <p>
                <strong>Our commitment to you:</strong> Despite our affiliate relationships, we
                maintain strict editorial independence. Our reviews and recommendations are based on
                our genuine opinions formed after hands-on testing and research.
              </p>
              <p>
                We never accept payment for positive reviews or allow affiliate relationships to
                influence our editorial content. If a product does not meet our standards, we will not
                recommend it regardless of potential affiliate earnings.
              </p>
              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <h3 className="mb-2 font-medium text-foreground">Our Review Process</h3>
                <ul className="ml-4 list-disc space-y-1 text-sm">
                  <li>Products are selected based on relevance and reader interest</li>
                  <li>We conduct hands-on testing whenever possible</li>
                  <li>We research user reviews and expert opinions</li>
                  <li>Recommendations are made based on merit, not commission rates</li>
                </ul>
              </div>
            </DisclaimerSection>

            <DisclaimerSection id="content-accuracy" title="Content Accuracy Disclaimer">
              <p>
                While we strive to provide accurate, up-to-date information about {nicheName}, we
                cannot guarantee the accuracy, completeness, or reliability of any content on this
                site.
              </p>
              <p>
                <strong>Please note:</strong>
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  Prices, availability, and product specifications may change without notice
                </li>
                <li>
                  Product performance may vary based on individual circumstances
                </li>
                <li>
                  Our testing conditions may differ from your use case
                </li>
                <li>
                  Features and specifications are subject to manufacturer changes
                </li>
              </ul>
              <p>
                We encourage readers to verify important information directly with manufacturers or
                retailers before making purchasing decisions.
              </p>
            </DisclaimerSection>

            <DisclaimerSection id="no-professional-advice" title="No Professional Advice">
              <p>
                The content on {site.name} is provided for informational and entertainment purposes
                only. Nothing on this site constitutes professional advice, including but not
                limited to:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  <strong>Medical or Health Advice:</strong> Always consult a qualified healthcare
                  professional for health-related decisions.
                </li>
                <li>
                  <strong>Financial Advice:</strong> Consult a licensed financial advisor before
                  making financial decisions.
                </li>
                <li>
                  <strong>Legal Advice:</strong> Seek guidance from a qualified attorney for legal
                  matters.
                </li>
                <li>
                  <strong>Technical or Safety Advice:</strong> Follow manufacturer guidelines and
                  consult professionals for installation or safety concerns.
                </li>
              </ul>
            </DisclaimerSection>

            <DisclaimerSection id="product-liability" title="Product Liability">
              <p>
                {site.name} is not responsible for any products or services provided by third-party
                merchants. We do not manufacture, sell, or ship any products featured on this site.
              </p>
              <p>
                Any issues regarding product quality, shipping, returns, or warranty claims should
                be directed to the respective merchant or manufacturer. We are not liable for:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>Product defects or malfunctions</li>
                <li>Shipping delays or lost packages</li>
                <li>Merchant customer service issues</li>
                <li>Changes to product specifications or availability</li>
                <li>Damage or injury resulting from product use</li>
              </ul>
            </DisclaimerSection>

            <DisclaimerSection id="testimonials" title="Testimonials and Reviews">
              <p>
                Any testimonials, reviews, or user experiences shared on this site represent
                individual opinions and may not reflect typical results. Your experience with any
                product may differ based on various factors including:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>Individual needs and preferences</li>
                <li>Use case and environment</li>
                <li>Product variations or updates</li>
                <li>User skill level and expectations</li>
              </ul>
            </DisclaimerSection>

            <DisclaimerSection id="third-party-links" title="Third-Party Links">
              <p>
                Our site contains links to external websites and resources. These links are
                provided for convenience and informational purposes only. We do not endorse or
                assume responsibility for:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>The content or accuracy of external sites</li>
                <li>The privacy practices of third-party sites</li>
                <li>Any products or services offered by third parties</li>
              </ul>
              <p>
                We encourage you to review the terms and privacy policies of any third-party sites
                you visit.
              </p>
            </DisclaimerSection>

            <DisclaimerSection id="changes" title="Changes to This Disclaimer">
              <p>
                We may update this disclaimer from time to time to reflect changes in our practices
                or legal requirements. We encourage you to review this page periodically.
              </p>
              <p>
                Continued use of the site following any changes constitutes acceptance of the
                updated disclaimer.
              </p>
            </DisclaimerSection>

            <DisclaimerSection id="contact" title="Questions?">
              <p>
                If you have any questions about this disclaimer or our affiliate relationships,
                please do not hesitate to contact us:
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  Email Us
                </a>
                <Link
                  href={`/${siteSlug}/contact`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  Contact Form
                </Link>
              </div>
            </DisclaimerSection>
          </div>

          {/* Bottom Notice */}
          <div className="mt-12 rounded-lg bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              By using {site.name}, you acknowledge that you have read and understood this
              disclaimer. Thank you for supporting our work through our affiliate links.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
