import * as React from "react"

import { cn } from "@affiliate/utils"

/**
 * Card Component
 *
 * Design philosophy:
 * - Subtle borders over heavy shadows
 * - Smooth transitions on hover
 * - Clear hierarchy in sub-components
 * - Flexible enough for various content types
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Enable interactive hover effects */
    interactive?: boolean
    /** Padding variant */
    padding?: 'none' | 'sm' | 'default' | 'lg'
  }
>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base styles
      "rounded-xl border border-border/50 bg-card text-card-foreground",
      // Subtle shadow
      "shadow-sm",
      // Interactive styles
      interactive && [
        "transition-all duration-200",
        "hover:border-border hover:shadow-md",
        "cursor-pointer",
      ],
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  }
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * CardImage Component
 * For consistent image placement in cards
 */
const CardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Aspect ratio */
    aspect?: 'auto' | 'square' | 'video' | 'product'
    /** Position in card */
    position?: 'top' | 'left' | 'right'
  }
>(({ className, aspect = 'product', position = 'top', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden bg-muted",
      // Position-based rounding
      position === 'top' && "rounded-t-xl",
      position === 'left' && "rounded-l-xl",
      position === 'right' && "rounded-r-xl",
      // Aspect ratios
      aspect === 'square' && "aspect-square",
      aspect === 'video' && "aspect-video",
      aspect === 'product' && "aspect-[4/3]",
      className
    )}
    {...props}
  />
))
CardImage.displayName = "CardImage"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImage }
