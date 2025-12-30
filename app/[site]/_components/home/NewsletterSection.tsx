/**
 * Newsletter Section Component
 *
 * Email signup section for the homepage.
 * Can be used standalone or as part of a larger section.
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NewsletterSectionProps {
  /** Optional title override */
  title?: string
  /** Optional description override */
  description?: string
  /** Site slug for tracking (reserved for future analytics) */
  siteSlug?: string
  /** Optional className for styling */
  className?: string
}

export function NewsletterSection({
  title = 'Stay Updated',
  description = 'Get the latest product reviews and buying guides delivered to your inbox.',
  siteSlug: _siteSlug,
  className,
}: NewsletterSectionProps) {
  // siteSlug reserved for future analytics/tracking implementation
  void _siteSlug
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')

    // Simulate API call - replace with actual newsletter signup
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')
      setMessage('Thanks for subscribing! Check your email to confirm.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section className={cn('py-12 lg:py-16', className)}>
      <div className="container-wide section-padding">
        <div className="rounded-2xl border border-border/50 bg-card p-8 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {description}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  'flex-1 rounded-lg border border-border bg-background px-4 py-3',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:border-[var(--site-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]/20',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  'rounded-lg px-6 py-3 text-sm font-semibold text-white',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                style={{
                  backgroundColor: 'var(--site-primary)',
                }}
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin\" fill="none\" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subscribing...
                  </span>
                ) : status === 'success' ? (
                  'Subscribed!'
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            {message && (
              <p
                className={cn(
                  'mt-4 text-sm',
                  status === 'error' && 'text-red-500',
                  status === 'success' && 'text-green-600'
                )}
              >
                {message}
              </p>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
