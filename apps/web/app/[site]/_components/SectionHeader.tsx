import { cn } from '@affiliate/utils'

export interface SectionHeaderProps {
  /** Small label above the title */
  label?: string
  /** Main section title */
  title: string
  /** Optional description below the title */
  description?: string
  /** Text alignment */
  align?: 'left' | 'center'
  /** Additional class names */
  className?: string
}

/**
 * SectionHeader Component
 *
 * A reusable section header with consistent styling.
 * Features:
 * - Optional colored label
 * - Main title with proper heading semantics
 * - Optional description
 * - Left or center alignment
 */
export default function SectionHeader({
  label,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-10', align === 'center' && 'text-center', className)}>
      {label && (
        <p
          className="text-sm font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--site-primary)' }}
        >
          {label}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-3 text-muted-foreground leading-relaxed',
            align === 'center' ? 'max-w-xl mx-auto' : 'max-w-2xl'
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
