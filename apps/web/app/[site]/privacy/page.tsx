import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBySlug } from '@affiliate/api/sites';
import { BreadcrumbJsonLd, JsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import type { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';

interface PrivacyPageProps {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Privacy Policy' };
  }

  const title = `Privacy Policy | ${site.name}`;
  const description = `Privacy policy for ${site.name}. Learn how we collect, use, and protect your personal information.`;
  const canonicalUrl = buildCanonicalUrl(site, '/privacy');
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
 * Policy Section Component
 */
function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  const baseUrl = buildCanonicalUrl(site, '');
  const canonicalUrl = buildCanonicalUrl(site, '/privacy');
  const domain = site.domain || 'example.com';

  // Extract contact email from social
  const social = site.social as { email?: string } | null;
  const contactEmail = social?.email || `privacy@${domain}`;

  // Last updated date
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Privacy Policy', url: canonicalUrl },
  ];

  // JSON-LD structured data
  const webPageJsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy - ${site.name}`,
    description: `Privacy policy for ${site.name}. Learn how we collect, use, and protect your personal information.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: baseUrl,
    },
  };

  // Table of contents items
  const tocItems = [
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use-information', title: 'How We Use Your Information' },
    { id: 'cookies', title: 'Cookies and Tracking Technologies' },
    { id: 'third-party-services', title: 'Third-Party Services' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'children', title: "Children's Privacy" },
    { id: 'changes', title: 'Changes to This Policy' },
    { id: 'contact', title: 'Contact Us' },
  ];

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
            <li className="font-medium">Privacy Policy</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="mb-12">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </header>

          <div className="grid gap-12 lg:grid-cols-4">
            {/* Table of Contents - Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                  On This Page
                </h2>
                <nav aria-label="Table of contents">
                  <ul className="space-y-2">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="prose prose-gray max-w-none dark:prose-invert">
                {/* Introduction */}
                <div className="mb-8 rounded-lg border border-border/50 bg-muted/30 p-6">
                  <p className="text-muted-foreground">
                    At {site.name}, we take your privacy seriously. This Privacy Policy explains
                    how we collect, use, disclose, and safeguard your information when you visit
                    our website <strong>{domain}</strong>. Please read this policy carefully.
                  </p>
                </div>

                <div className="space-y-10">
                  <PolicySection id="information-we-collect" title="Information We Collect">
                    <p>We may collect information about you in various ways:</p>
                    <h3 className="mt-4 text-lg font-medium text-foreground">
                      Information You Provide
                    </h3>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        <strong>Contact Information:</strong> When you use our contact form, you
                        provide your name, email address, and message content.
                      </li>
                      <li>
                        <strong>Newsletter Subscription:</strong> If you subscribe to our
                        newsletter, we collect your email address.
                      </li>
                      <li>
                        <strong>Comments:</strong> If you leave comments on our content, we may
                        collect your name and email address.
                      </li>
                    </ul>

                    <h3 className="mt-4 text-lg font-medium text-foreground">
                      Information Collected Automatically
                    </h3>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        <strong>Log Data:</strong> Our servers automatically record information
                        including your IP address, browser type, referring/exit pages, and
                        timestamps.
                      </li>
                      <li>
                        <strong>Device Information:</strong> We collect information about the
                        device you use to access our site, including device type, operating system,
                        and unique device identifiers.
                      </li>
                      <li>
                        <strong>Usage Data:</strong> We track how you interact with our site,
                        including pages visited, time spent, and click patterns.
                      </li>
                    </ul>
                  </PolicySection>

                  <PolicySection id="how-we-use-information" title="How We Use Your Information">
                    <p>We use the information we collect for various purposes:</p>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>To provide, maintain, and improve our website and services</li>
                      <li>To respond to your inquiries and fulfill your requests</li>
                      <li>To send you newsletters and marketing communications (with your consent)</li>
                      <li>To analyze usage patterns and improve user experience</li>
                      <li>To detect, prevent, and address technical issues or fraud</li>
                      <li>To comply with legal obligations</li>
                    </ul>
                  </PolicySection>

                  <PolicySection id="cookies" title="Cookies and Tracking Technologies">
                    <p>
                      We use cookies and similar tracking technologies to collect and store
                      information about your preferences and activity on our site.
                    </p>

                    <h3 className="mt-4 text-lg font-medium text-foreground">Types of Cookies We Use</h3>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        <strong>Essential Cookies:</strong> Necessary for the website to function
                        properly. These cannot be disabled.
                      </li>
                      <li>
                        <strong>Analytics Cookies:</strong> Help us understand how visitors
                        interact with our site through anonymous data collection.
                      </li>
                      <li>
                        <strong>Preference Cookies:</strong> Remember your settings and preferences
                        for future visits.
                      </li>
                      <li>
                        <strong>Marketing Cookies:</strong> Used to track visitors across websites
                        to display relevant advertisements.
                      </li>
                    </ul>

                    <p className="mt-4">
                      You can control cookies through your browser settings. Note that disabling
                      certain cookies may affect site functionality.
                    </p>
                  </PolicySection>

                  <PolicySection id="third-party-services" title="Third-Party Services">
                    <p>We may use third-party services that collect, monitor, and analyze data:</p>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        <strong>Analytics:</strong> We use analytics services (such as Google
                        Analytics) to understand site usage. These services may use cookies and
                        collect data about your visit.
                      </li>
                      <li>
                        <strong>Affiliate Programs:</strong> We participate in affiliate programs.
                        When you click affiliate links, third-party networks may place cookies to
                        track conversions.
                      </li>
                      <li>
                        <strong>Advertising:</strong> We may display advertisements from third-party
                        ad networks. These networks may use cookies and tracking technologies.
                      </li>
                    </ul>
                    <p className="mt-4">
                      We are not responsible for the privacy practices of third-party services. We
                      encourage you to review their privacy policies.
                    </p>
                  </PolicySection>

                  <PolicySection id="data-security" title="Data Security">
                    <p>
                      We implement appropriate technical and organizational security measures to
                      protect your personal information against unauthorized access, alteration,
                      disclosure, or destruction.
                    </p>
                    <p>
                      However, no method of transmission over the Internet or electronic storage is
                      100% secure. While we strive to protect your information, we cannot guarantee
                      absolute security.
                    </p>
                  </PolicySection>

                  <PolicySection id="your-rights" title="Your Rights">
                    <p>Depending on your location, you may have certain rights regarding your data:</p>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        <strong>Access:</strong> Request access to the personal information we hold
                        about you.
                      </li>
                      <li>
                        <strong>Correction:</strong> Request correction of inaccurate personal
                        information.
                      </li>
                      <li>
                        <strong>Deletion:</strong> Request deletion of your personal information.
                      </li>
                      <li>
                        <strong>Opt-Out:</strong> Opt out of marketing communications at any time.
                      </li>
                      <li>
                        <strong>Data Portability:</strong> Request a copy of your data in a
                        portable format.
                      </li>
                    </ul>
                    <p className="mt-4">
                      To exercise any of these rights, please contact us at{' '}
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-foreground underline hover:no-underline"
                      >
                        {contactEmail}
                      </a>
                      .
                    </p>
                  </PolicySection>

                  <PolicySection id="children" title="Children's Privacy">
                    <p>
                      Our website is not intended for children under 13 years of age. We do not
                      knowingly collect personal information from children under 13. If you are a
                      parent or guardian and believe your child has provided us with personal
                      information, please contact us immediately.
                    </p>
                  </PolicySection>

                  <PolicySection id="changes" title="Changes to This Policy">
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of
                      any changes by posting the new Privacy Policy on this page and updating the
                      &quot;Last updated&quot; date.
                    </p>
                    <p>
                      We encourage you to review this Privacy Policy periodically for any changes.
                      Continued use of our site after modifications constitutes acceptance of the
                      updated policy.
                    </p>
                  </PolicySection>

                  <PolicySection id="contact" title="Contact Us">
                    <p>
                      If you have any questions about this Privacy Policy or our data practices,
                      please contact us:
                    </p>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        <strong>Email:</strong>{' '}
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-foreground underline hover:no-underline"
                        >
                          {contactEmail}
                        </a>
                      </li>
                      <li>
                        <strong>Contact Form:</strong>{' '}
                        <Link
                          href={`/${siteSlug}/contact`}
                          className="text-foreground underline hover:no-underline"
                        >
                          Contact Us
                        </Link>
                      </li>
                    </ul>
                  </PolicySection>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
