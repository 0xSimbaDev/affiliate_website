'use client'

/**
 * Pros & Cons Section - Modern Minimalist Design
 *
 * Clean, typography-driven design with:
 * - Subtle verdict card with left accent border
 * - Minimal pro/con items with site-themed accents
 * - No gradients or heavy colors - uses design tokens
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@affiliate/utils'

interface ProsConsProps extends SectionProps {
  /** Custom label for pros section */
  prosLabel?: string
  /** Custom label for cons section */
  consLabel?: string
  /** Show verdict card above pros/cons */
  showVerdict?: boolean
}

/**
 * Verdict Card - Clean, minimal design with left accent
 */
function VerdictCard({ rating }: { rating: number | null }) {
  if (!rating) return null

  const ratingLabel =
    rating >= 4.5 ? 'Excellent' :
    rating >= 4.0 ? 'Great' :
    rating >= 3.5 ? 'Good' :
    rating >= 3.0 ? 'Average' : 'Below Average'

  return (
    <div className="mb-10">
      <div className="p-6 rounded-lg border border-border/50 bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Rating info with left accent */}
          <div className="border-l-4 border-[var(--site-primary)] pl-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Our Verdict
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/ 5</span>
              <span className="text-lg font-medium text-foreground ml-2">
                {ratingLabel}
              </span>
            </div>
          </div>

          {/* Stars - subtle */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= Math.round(rating)
                    ? 'text-amber-400'
                    : 'text-border'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Pro Item - Minimal with site-primary left accent
 */
function ProItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-l-2 border-[var(--site-primary)] pl-4">
      <svg
        className="w-4 h-4 text-[var(--site-primary)] mt-0.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {text}
      </p>
    </div>
  )
}

/**
 * Con Item - Minimal with muted left accent
 */
function ConItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-l-2 border-muted-foreground/30 pl-4">
      <svg
        className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {text}
      </p>
    </div>
  )
}

export default function ProsConsSection({
  className,
  prosLabel = 'What We Like',
  consLabel = 'What Could Be Better',
  showVerdict = true,
}: ProsConsProps) {
  const { metadata, rating } = useProductPage()

  const pros = metadata.pros
  const cons = metadata.cons

  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return null
  }

  return (
    <section className={cn('', className)}>
      {/* Verdict Card */}
      {showVerdict && <VerdictCard rating={rating} />}

      {/* Pros & Cons Grid */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Pros Column */}
        {pros && pros.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {prosLabel}
            </h3>
            <div className="space-y-1">
              {pros.map((pro, index) => (
                <ProItem key={index} text={pro} />
              ))}
            </div>
          </div>
        )}

        {/* Cons Column */}
        {cons && cons.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {consLabel}
            </h3>
            <div className="space-y-1">
              {cons.map((con, index) => (
                <ConItem key={index} text={con} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
