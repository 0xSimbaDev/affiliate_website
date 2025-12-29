'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  siteName: string; // Reserved for future use (e.g., personalized messages)
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Contact Form Component
 *
 * A client-side form with validation and success/error states.
 * Note: Actual email sending is not implemented - this is UI only.
 */
export function ContactForm(_props: ContactFormProps) {
  // Props available for future personalization (e.g., siteName for custom messages)
  void _props; // Explicitly mark as intentionally unused for now
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('submitting');

    // Simulate form submission delay
    // In production, this would call an API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, always succeed
    setStatus('success');

    // Reset form after success
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  const handleReset = () => {
    setStatus('idle');
    setErrors({});
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--site-primary) 10%, transparent)' }}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            style={{ color: 'var(--site-primary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Message Sent!</h3>
        <p className="mb-6 text-muted-foreground">
          Thank you for reaching out. We will get back to you as soon as possible.
        </p>
        <Button variant="outline" onClick={handleReset}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
          Your Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'transition-colors duration-150',
            errors.name
              ? 'border-destructive focus:ring-destructive'
              : 'border-border focus:border-[var(--site-primary)] focus:ring-[var(--site-primary)]'
          )}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
          Email Address <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'transition-colors duration-150',
            errors.email
              ? 'border-destructive focus:ring-destructive'
              : 'border-border focus:border-[var(--site-primary)] focus:ring-[var(--site-primary)]'
          )}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">
          Subject <span className="text-destructive">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'transition-colors duration-150',
            !formData.subject && 'text-muted-foreground',
            errors.subject
              ? 'border-destructive focus:ring-destructive'
              : 'border-border focus:border-[var(--site-primary)] focus:ring-[var(--site-primary)]'
          )}
          aria-invalid={errors.subject ? 'true' : 'false'}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        >
          <option value="">Select a subject</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Product Suggestion">Product Suggestion</option>
          <option value="Review Feedback">Review Feedback</option>
          <option value="Partnership Opportunity">Partnership Opportunity</option>
          <option value="Report an Issue">Report an Issue</option>
          <option value="Other">Other</option>
        </select>
        {errors.subject && (
          <p id="subject-error" className="mt-1 text-sm text-destructive">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          placeholder={`Tell us how we can help you...`}
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'transition-colors duration-150 resize-none',
            errors.message
              ? 'border-destructive focus:ring-destructive'
              : 'border-border focus:border-[var(--site-primary)] focus:ring-[var(--site-primary)]'
          )}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="site"
        size="lg"
        className="w-full"
        isLoading={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </Button>

      {/* Error State */}
      {status === 'error' && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
          Something went wrong. Please try again later.
        </div>
      )}
    </form>
  );
}
