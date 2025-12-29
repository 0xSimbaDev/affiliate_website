import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBySlug } from '@/lib/api/sites';
import { BreadcrumbJsonLd, JsonLd } from '@/components/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@/lib/utils';
import type { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';

interface AboutPageProps {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'About' };
  }

  const title = `About Us | ${site.name}`;
  const description = `Learn about ${site.name}, our mission, and our commitment to providing honest, thorough product reviews and recommendations.`;
  const canonicalUrl = buildCanonicalUrl(site, '/about');
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
      card: 'summary_large_image',
      title,
      description,
      ...(twitterHandle && { site: twitterHandle }),
    },
  };
}

/**
 * Value Card Component
 */
function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-border hover:shadow-md">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'color-mix(in srgb, var(--site-primary) 10%, transparent)' }}
      >
        <div style={{ color: 'var(--site-primary)' }}>{icon}</div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  const baseUrl = buildCanonicalUrl(site, '');
  const canonicalUrl = buildCanonicalUrl(site, '/about');
  const nicheName = site.niche?.name || 'Products';

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'About Us', url: canonicalUrl },
  ];

  // JSON-LD structured data for AboutPage
  const webPageJsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${site.name}`,
    description: `Learn about ${site.name}, our mission, and our commitment to providing honest, thorough product reviews.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: baseUrl,
      ...(site.description && { description: site.description }),
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
            <li className="font-medium">About Us</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="mb-3 text-sm font-medium uppercase tracking-wide"
              style={{ color: 'var(--site-primary)' }}
            >
              About Us
            </p>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Helping You Make Better {nicheName} Decisions
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {site.description ||
                `Welcome to ${site.name}. We're dedicated to providing honest, thorough, and independent reviews to help you find the perfect products for your needs.`}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-8 lg:p-12">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Our Mission
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  At {site.name}, we believe everyone deserves access to trustworthy product
                  information. In a world flooded with sponsored content and biased reviews, we stand
                  apart by maintaining strict editorial independence.
                </p>
                <p className="leading-relaxed">
                  Our team of experts tests and evaluates products hands-on, considering real-world
                  performance, value for money, and long-term reliability. We do not just read spec
                  sheets - we use the products ourselves to understand how they will perform for you.
                </p>
                <p className="leading-relaxed">
                  Whether you are looking for the best budget option or a premium choice, we are here
                  to guide you through the decision-making process with clarity and confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Our Values
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ValueCard
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                }
                title="Independence"
                description="Our reviews are never influenced by manufacturers or advertisers. We maintain strict editorial standards."
              />
              <ValueCard
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                    />
                  </svg>
                }
                title="Transparency"
                description="We clearly disclose our affiliate relationships and never let them affect our recommendations."
              />
              <ValueCard
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                    />
                  </svg>
                }
                title="Thoroughness"
                description="We test every product we recommend, examining features, build quality, and real-world performance."
              />
              <ValueCard
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                }
                title="Continuous Updates"
                description="We regularly revisit and update our reviews as products evolve and new options become available."
              />
              <ValueCard
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                }
                title="Reader-First"
                description="Every decision we make is guided by what's best for our readers, not what's best for our bottom line."
              />
              <ValueCard
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                    />
                  </svg>
                }
                title="Expertise"
                description="Our reviewers are passionate experts in their fields with years of hands-on experience."
              />
            </div>
          </div>
        </section>

        {/* Editorial Standards Section */}
        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Our Editorial Standards
            </h2>
            <div className="space-y-6">
              <div className="rounded-lg border border-border/50 bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Hands-On Testing</h3>
                <p className="text-muted-foreground">
                  We do not just aggregate specs and user reviews. Our team personally tests each
                  product we recommend, putting it through real-world scenarios to understand its
                  strengths and weaknesses.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Unbiased Recommendations</h3>
                <p className="text-muted-foreground">
                  While we earn affiliate commissions from purchases made through our links, this
                  never influences which products we recommend. We feature products based solely on
                  their merits.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Regular Updates</h3>
                <p className="text-muted-foreground">
                  The market changes constantly, and so do our recommendations. We continuously
                  monitor prices, availability, and new product releases to keep our guides current
                  and relevant.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-8">
          <div className="mx-auto max-w-4xl">
            <div
              className="rounded-2xl p-8 text-center lg:p-12"
              style={{ backgroundColor: 'color-mix(in srgb, var(--site-primary) 10%, transparent)' }}
            >
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Have Questions?
              </h2>
              <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
                We would love to hear from you. Whether you have a product suggestion, feedback on our
                reviews, or just want to say hello, do not hesitate to reach out.
              </p>
              <Link
                href={`/${siteSlug}/contact`}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                Contact Us
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
