'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

/**
 * ImageGallery - Interactive product image gallery
 *
 * Features:
 * - Touch swipe support for mobile
 * - Keyboard navigation (left/right arrows)
 * - Minimalist dot indicators
 * - Smooth transitions
 */
export default function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          'relative aspect-square bg-muted rounded-2xl flex items-center justify-center',
          className
        )}
      >
        <svg
          className="w-16 h-16 text-muted-foreground/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Main Image Container */}
      <div
        className="relative aspect-square bg-muted rounded-2xl overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Product image gallery"
        aria-roledescription="carousel"
      >
        {/* Current Image */}
        <div className="relative w-full h-full">
          <Image
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1} of ${images.length}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            priority={currentIndex === 0}
          />
        </div>

        {/* Navigation Arrows - Desktop only */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'hidden md:flex items-center justify-center',
                'w-10 h-10 rounded-full',
                'bg-white/90 backdrop-blur-sm shadow-sm',
                'text-foreground/70 hover:text-foreground',
                'transition-all duration-200',
                'hover:bg-white hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--site-primary)]'
              )}
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'hidden md:flex items-center justify-center',
                'w-10 h-10 rounded-full',
                'bg-white/90 backdrop-blur-sm shadow-sm',
                'text-foreground/70 hover:text-foreground',
                'transition-all duration-200',
                'hover:bg-white hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--site-primary)]'
              )}
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter - Mobile */}
        {images.length > 1 && (
          <div
            className={cn(
              'absolute bottom-3 right-3 md:hidden',
              'px-2.5 py-1 rounded-full',
              'bg-black/60 backdrop-blur-sm',
              'text-xs font-medium text-white'
            )}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 mt-4"
          role="tablist"
          aria-label="Image gallery navigation"
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`View image ${index + 1}`}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-[var(--site-primary)] w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
