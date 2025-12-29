'use client'

/**
 * Full Review Section
 *
 * Renders HTML content with Tailwind Typography prose classes.
 * Customized to match the design system with site-primary accents.
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@/lib/utils'

interface FullReviewProps extends SectionProps {
  /** Section heading */
  heading?: string
  /** Show section heading */
  showHeading?: boolean
}

export default function FullReviewSection({
  className,
  heading = 'Full Review',
  showHeading = true,
}: FullReviewProps) {
  const { product } = useProductPage()

  if (!product.content) {
    return null
  }

  return (
    <section className={cn('', className)}>
      {showHeading && (
        <div className="flex items-center gap-3 mb-8">
          <div className="border-l-4 border-[var(--site-primary)] pl-4">
            <h2 className="text-2xl font-bold text-foreground">
              {heading}
            </h2>
          </div>
        </div>
      )}

      {/* Review Content with Tailwind Typography */}
      <div
        className={cn(
          'prose prose-neutral dark:prose-invert max-w-none',
          // Headings
          'prose-headings:font-bold prose-headings:text-foreground',
          'prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4',
          'prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3',
          // Paragraphs
          'prose-p:text-muted-foreground prose-p:leading-relaxed',
          // Strong
          'prose-strong:text-foreground prose-strong:font-semibold',
          // Links
          'prose-a:text-[var(--site-primary)] prose-a:no-underline hover:prose-a:underline',
          // Lists
          'prose-li:text-muted-foreground prose-li:marker:text-[var(--site-primary)]',
          // Blockquotes
          'prose-blockquote:border-l-[var(--site-primary)] prose-blockquote:text-foreground',
          // Code
          'prose-code:text-[var(--site-primary)]'
        )}
        dangerouslySetInnerHTML={{ __html: product.content }}
      />
    </section>
  )
}
