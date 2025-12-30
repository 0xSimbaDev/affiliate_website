'use client'

/**
 * Full Review Section
 *
 * Renders HTML content with Tailwind Typography prose classes.
 * Customized to match the design system with site-primary accents.
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@affiliate/utils'

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
        className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-semibold prose-a:text-[color:var(--site-primary)] prose-a:no-underline hover:prose-a:underline prose-li:text-muted-foreground prose-blockquote:border-l-[color:var(--site-primary)] prose-blockquote:text-foreground"
        dangerouslySetInnerHTML={{ __html: product.content }}
      />
    </section>
  )
}
