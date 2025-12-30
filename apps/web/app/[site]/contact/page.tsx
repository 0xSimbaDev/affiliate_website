import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBySlug } from '@affiliate/api/sites';
import { BreadcrumbJsonLd, JsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import { ContactForm } from './_components/ContactForm';
import type { Metadata } from 'next';
import type { ContactPage as ContactPageSchema, WithContext } from 'schema-dts';

interface ContactPageProps {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Contact' };
  }

  const title = `Contact Us | ${site.name}`;
  const description = `Get in touch with ${site.name}. We'd love to hear from you about product suggestions, review feedback, or any questions.`;
  const canonicalUrl = buildCanonicalUrl(site, '/contact');
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
 * Social Link Component
 */
function SocialLink({
  platform,
  href,
  label,
  icon,
}: {
  platform: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md"
      aria-label={`Follow us on ${platform}`}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'color-mix(in srgb, var(--site-primary) 10%, transparent)' }}
      >
        <div style={{ color: 'var(--site-primary)' }}>{icon}</div>
      </div>
      <div>
        <p className="font-medium text-foreground">{platform}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </a>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  const baseUrl = buildCanonicalUrl(site, '');
  const canonicalUrl = buildCanonicalUrl(site, '/contact');

  // Extract social links
  const social = site.social as {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    email?: string;
  } | null;

  const contactEmail = social?.email || `contact@${site.domain || 'example.com'}`;

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Contact Us', url: canonicalUrl },
  ];

  // JSON-LD structured data for ContactPage
  const contactPageJsonLd: WithContext<ContactPageSchema> = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${site.name}`,
    description: `Get in touch with ${site.name}. We'd love to hear from you.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: baseUrl,
      ...(contactEmail && { email: contactEmail }),
      ...(social?.twitter && { sameAs: [social.twitter] }),
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd data={contactPageJsonLd} />

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
            <li className="font-medium">Contact Us</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="mb-12">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="mb-3 text-sm font-medium uppercase tracking-wide"
              style={{ color: 'var(--site-primary)' }}
            >
              Get In Touch
            </p>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              We Would Love to Hear From You
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Have a question, feedback, or product suggestion? We are here to help. Fill out the
              form below and we will get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border/50 bg-card p-6 lg:p-8">
                <h2 className="mb-6 text-xl font-semibold text-foreground">Send Us a Message</h2>
                <ContactForm siteName={site.name} />
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2">
              {/* Email Card */}
              <div className="mb-6 rounded-xl border border-border/50 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Email Us</h3>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--site-primary) 10%, transparent)' }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      style={{ color: 'var(--site-primary)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{contactEmail}</span>
                </a>
              </div>

              {/* Response Time */}
              <div className="mb-6 rounded-xl border border-border/50 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Response Time</h3>
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--site-primary) 10%, transparent)' }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      style={{ color: 'var(--site-primary)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within <strong className="text-foreground">24-48 hours</strong>{' '}
                      during business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(social?.twitter || social?.facebook || social?.instagram || social?.linkedin) && (
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Follow Us</h3>
                  <div className="space-y-3">
                    {social?.twitter && (
                      <SocialLink
                        platform="X (Twitter)"
                        href={social.twitter}
                        label="Follow for updates"
                        icon={
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        }
                      />
                    )}
                    {social?.facebook && (
                      <SocialLink
                        platform="Facebook"
                        href={social.facebook}
                        label="Like our page"
                        icon={
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        }
                      />
                    )}
                    {social?.instagram && (
                      <SocialLink
                        platform="Instagram"
                        href={social.instagram}
                        label="See our photos"
                        icon={
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        }
                      />
                    )}
                    {social?.linkedin && (
                      <SocialLink
                        platform="LinkedIn"
                        href={social.linkedin}
                        label="Connect with us"
                        icon={
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">
                How do I suggest a product for review?
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the contact form above and select &quot;Product Suggestion&quot; as the subject. Include
                the product name, manufacturer, and why you think it would be a good fit for our
                audience.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">
                Do you accept sponsored content or paid reviews?
              </h3>
              <p className="text-sm text-muted-foreground">
                No. All our reviews are independent and unbiased. We never accept payment for
                reviews or let affiliate relationships influence our recommendations.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">
                I found an error in one of your reviews. How can I report it?
              </h3>
              <p className="text-sm text-muted-foreground">
                We appreciate corrections! Please use the contact form with &quot;Report an Issue&quot; as
                the subject. Include the article URL and details about the error.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
