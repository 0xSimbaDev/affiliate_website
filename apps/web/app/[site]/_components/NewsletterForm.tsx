'use client'

import { cn } from '@affiliate/utils'

interface NewsletterFormProps {
  variant?: 'default' | 'hero'
}

/**
 * Newsletter Signup Form
 * Client component for handling form interactions
 */
export default function NewsletterForm({ variant = 'default' }: NewsletterFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
  }

  if (variant === 'hero') {
    return (
      <form
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Enter your email"
          className={cn(
            'flex-1 px-4 py-3 text-sm',
            'bg-white/10 border border-white/20 rounded-lg',
            'text-white placeholder:text-white/60',
            'focus:outline-none focus:ring-2 focus:ring-white/30'
          )}
        />
        <button
          type="submit"
          className={cn(
            'px-6 py-3 text-sm font-medium rounded-lg',
            'bg-white text-foreground',
            'hover:bg-white/90 transition-colors duration-150'
          )}
        >
          Subscribe
        </button>
      </form>
    )
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email address"
        className={cn(
          'flex-1 min-w-0 px-3 py-2 text-sm',
          'bg-background border border-border rounded-lg',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'focus:border-transparent'
        )}
        style={{ '--tw-ring-color': 'var(--site-primary)' } as React.CSSProperties}
      />
      <button
        type="submit"
        className={cn(
          'px-4 py-2 text-sm font-medium text-white rounded-lg',
          'btn-site-primary',
          'focus:outline-none focus:ring-2 focus:ring-offset-2'
        )}
      >
        Join
      </button>
    </form>
  )
}
