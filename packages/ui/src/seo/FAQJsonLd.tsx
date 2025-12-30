/**
 * FAQ JSON-LD Structured Data Component
 *
 * Renders Schema.org FAQPage structured data for FAQ sections.
 */

import { JsonLd } from './JsonLd';
import type { FAQPage, WithContext, Question } from 'schema-dts';

interface FAQItem {
  /** The question */
  question: string;
  /** The answer (can include HTML) */
  answer: string;
}

interface FAQJsonLdProps {
  /** Array of FAQ items */
  faqs: FAQItem[];
}

/**
 * Renders Schema.org FAQPage structured data.
 *
 * @see https://schema.org/FAQPage
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 *
 * @example
 * <FAQJsonLd
 *   faqs={[
 *     { question: "What is the return policy?", answer: "We offer 30-day returns." },
 *     { question: "How long is shipping?", answer: "2-5 business days." },
 *   ]}
 * />
 */
export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  if (faqs.length === 0) return null;

  const data: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(
      (faq): Question => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })
    ),
  };

  return <JsonLd data={data} />;
}
