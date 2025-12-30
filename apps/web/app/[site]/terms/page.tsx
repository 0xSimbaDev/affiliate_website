import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBySlug } from '@affiliate/api/sites';
import { BreadcrumbJsonLd, JsonLd } from '@affiliate/ui/seo';
import { buildCanonicalUrl, getTwitterHandle } from '@affiliate/utils';
import type { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';

interface TermsPageProps {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return { title: 'Terms of Service' };
  }

  const title = `Terms of Service | ${site.name}`;
  const description = `Terms of service for ${site.name}. Read our terms and conditions for using our website and services.`;
  const canonicalUrl = buildCanonicalUrl(site, '/terms');
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
 * Terms Section Component
 */
function TermsSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        <span className="mr-2" style={{ color: 'var(--site-primary)' }}>
          {number}.
        </span>
        {title}
      </h2>
      <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { site: siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  const baseUrl = buildCanonicalUrl(site, '');
  const canonicalUrl = buildCanonicalUrl(site, '/terms');
  const domain = site.domain || 'example.com';

  // Extract contact email from social
  const social = site.social as { email?: string } | null;
  const contactEmail = social?.email || `legal@${domain}`;

  // Last updated date
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Terms of Service', url: canonicalUrl },
  ];

  // JSON-LD structured data
  const webPageJsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Terms of Service - ${site.name}`,
    description: `Terms of service for ${site.name}. Read our terms and conditions for using our website.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: baseUrl,
    },
  };

  // Table of contents items
  const tocItems = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'use-license', title: 'Use License' },
    { id: 'user-conduct', title: 'User Conduct' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'affiliate-links', title: 'Affiliate Links & Advertising' },
    { id: 'user-content', title: 'User Content' },
    { id: 'disclaimers', title: 'Disclaimers' },
    { id: 'limitation-liability', title: 'Limitation of Liability' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'third-party-links', title: 'Third-Party Links' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Information' },
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
            <li className="font-medium">Terms of Service</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="mb-12">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
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
                    Please read these Terms of Service (&quot;Terms&quot;) carefully before using{' '}
                    <strong>{domain}</strong> (the &quot;Site&quot;) operated by {site.name} (&quot;we,&quot; &quot;us,&quot; or
                    &quot;our&quot;). Your access to and use of the Site is conditioned on your acceptance of
                    and compliance with these Terms.
                  </p>
                </div>

                <div className="space-y-10">
                  <TermsSection id="acceptance" number={1} title="Acceptance of Terms">
                    <p>
                      By accessing or using our Site, you agree to be bound by these Terms. If you
                      disagree with any part of the terms, then you may not access the Site.
                    </p>
                    <p>
                      We reserve the right to update or modify these Terms at any time without prior
                      notice. Your continued use of the Site following any changes indicates your
                      acceptance of the new Terms.
                    </p>
                  </TermsSection>

                  <TermsSection id="use-license" number={2} title="Use License">
                    <p>
                      Permission is granted to temporarily access the materials (information or
                      software) on {site.name} website for personal, non-commercial viewing only.
                      This is the grant of a license, not a transfer of title, and under this
                      license you may not:
                    </p>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>Modify or copy the materials</li>
                      <li>Use the materials for any commercial purpose or public display</li>
                      <li>
                        Attempt to decompile or reverse engineer any software on the Site
                      </li>
                      <li>Remove any copyright or proprietary notations from the materials</li>
                      <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                    </ul>
                    <p className="mt-4">
                      This license shall automatically terminate if you violate any of these
                      restrictions and may be terminated by {site.name} at any time.
                    </p>
                  </TermsSection>

                  <TermsSection id="user-conduct" number={3} title="User Conduct">
                    <p>When using our Site, you agree not to:</p>
                    <ul className="ml-4 mt-2 list-disc space-y-2">
                      <li>
                        Use the Site in any way that violates applicable laws or regulations
                      </li>
                      <li>
                        Engage in any conduct that restricts or inhibits any user&apos;s use or enjoyment
                        of the Site
                      </li>
                      <li>
                        Impersonate any person or entity or misrepresent your affiliation
                      </li>
                      <li>
                        Interfere with or disrupt the Site or servers connected to the Site
                      </li>
                      <li>
                        Attempt to gain unauthorized access to any portion of the Site
                      </li>
                      <li>
                        Use any robot, spider, or automated device to access the Site
                      </li>
                      <li>
                        Transmit any viruses, malware, or other harmful code
                      </li>
                    </ul>
                  </TermsSection>

                  <TermsSection id="intellectual-property" number={4} title="Intellectual Property">
                    <p>
                      The Site and its original content, features, and functionality are and will
                      remain the exclusive property of {site.name} and its licensors. The Site is
                      protected by copyright, trademark, and other intellectual property laws.
                    </p>
                    <p>
                      Our trademarks and trade dress may not be used in connection with any product
                      or service without the prior written consent of {site.name}.
                    </p>
                  </TermsSection>

                  <TermsSection id="affiliate-links" number={5} title="Affiliate Links & Advertising">
                    <p>
                      Our Site contains affiliate links and advertisements. When you click on these
                      links and make purchases, we may receive a commission at no additional cost to
                      you.
                    </p>
                    <p>
                      We strive to recommend only products we believe in, but we make no guarantees
                      about the products or services offered by third parties. Your interactions
                      with advertisers and third-party sites are solely between you and those
                      parties.
                    </p>
                    <p>
                      For more information about our affiliate relationships, please see our{' '}
                      <Link
                        href={`/${siteSlug}/disclaimer`}
                        className="text-foreground underline hover:no-underline"
                      >
                        Affiliate Disclaimer
                      </Link>
                      .
                    </p>
                  </TermsSection>

                  <TermsSection id="user-content" number={6} title="User Content">
                    <p>
                      If you submit any content to our Site (such as comments or feedback), you
                      grant us a non-exclusive, royalty-free, perpetual, and worldwide license to
                      use, reproduce, modify, and distribute such content.
                    </p>
                    <p>
                      You represent and warrant that you own or have the rights to any content you
                      submit and that such content does not violate the rights of any third party.
                    </p>
                    <p>
                      We reserve the right to remove any user content at our discretion without
                      notice.
                    </p>
                  </TermsSection>

                  <TermsSection id="disclaimers" number={7} title="Disclaimers">
                    <p>
                      THE SITE AND ITS CONTENT ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS
                      WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                    </p>
                    <p>
                      We do not warrant that the Site will be uninterrupted, secure, or error-free.
                      We make no warranties regarding the accuracy, reliability, or completeness of
                      any content on the Site.
                    </p>
                    <p>
                      Product reviews and recommendations are based on our opinions and experiences.
                      Individual results may vary. Always do your own research before making
                      purchasing decisions.
                    </p>
                  </TermsSection>

                  <TermsSection id="limitation-liability" number={8} title="Limitation of Liability">
                    <p>
                      IN NO EVENT SHALL {site.name.toUpperCase()}, ITS DIRECTORS, EMPLOYEES,
                      PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT,
                      INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                      LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                    <p>
                      Our total liability to you for any claims arising from use of the Site shall
                      not exceed the amount you paid us, if any, for accessing the Site.
                    </p>
                  </TermsSection>

                  <TermsSection id="indemnification" number={9} title="Indemnification">
                    <p>
                      You agree to defend, indemnify, and hold harmless {site.name} and its
                      affiliates from and against any claims, liabilities, damages, losses, and
                      expenses arising out of or in any way connected with your access to or use of
                      the Site or your violation of these Terms.
                    </p>
                  </TermsSection>

                  <TermsSection id="third-party-links" number={10} title="Third-Party Links">
                    <p>
                      Our Site may contain links to third-party websites or services that are not
                      owned or controlled by {site.name}. We have no control over, and assume no
                      responsibility for, the content, privacy policies, or practices of any
                      third-party websites or services.
                    </p>
                    <p>
                      We strongly advise you to read the terms and conditions and privacy policies
                      of any third-party sites you visit.
                    </p>
                  </TermsSection>

                  <TermsSection id="termination" number={11} title="Termination">
                    <p>
                      We may terminate or suspend your access to the Site immediately, without prior
                      notice or liability, for any reason whatsoever, including without limitation
                      if you breach these Terms.
                    </p>
                    <p>
                      Upon termination, your right to use the Site will immediately cease. All
                      provisions of the Terms which by their nature should survive termination shall
                      survive.
                    </p>
                  </TermsSection>

                  <TermsSection id="governing-law" number={12} title="Governing Law">
                    <p>
                      These Terms shall be governed and construed in accordance with the laws of the
                      United States, without regard to its conflict of law provisions.
                    </p>
                    <p>
                      Any disputes arising from these Terms or your use of the Site shall be
                      resolved through binding arbitration or in the courts of competent
                      jurisdiction.
                    </p>
                  </TermsSection>

                  <TermsSection id="changes" number={13} title="Changes to Terms">
                    <p>
                      We reserve the right to modify or replace these Terms at any time. If a
                      revision is material, we will try to provide at least 30 days notice prior to
                      any new terms taking effect.
                    </p>
                    <p>
                      What constitutes a material change will be determined at our sole discretion.
                      By continuing to access or use our Site after those revisions become
                      effective, you agree to be bound by the revised terms.
                    </p>
                  </TermsSection>

                  <TermsSection id="contact" number={14} title="Contact Information">
                    <p>
                      If you have any questions about these Terms, please contact us:
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
                  </TermsSection>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
