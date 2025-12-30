import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@affiliate/utils"

/**
 * Button Variants
 *
 * Design philosophy:
 * - Subtle shadows that enhance without being heavy
 * - Smooth transitions that feel responsive
 * - Clear visual hierarchy between variants
 * - Consistent padding and sizing across variants
 */
const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap text-sm font-medium",
    "rounded-lg",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm",
          "hover:bg-primary/90 hover:shadow-md",
          "active:scale-[0.98]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md",
          "active:scale-[0.98]",
        ].join(" "),
        outline: [
          "border border-border bg-background",
          "hover:bg-muted hover:border-muted-foreground/20",
          "active:scale-[0.98]",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "hover:bg-muted hover:text-accent-foreground",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
        // Site-themed variant - uses CSS custom properties
        site: [
          "bg-[var(--site-primary)] text-white",
          "shadow-sm",
          "hover:opacity-90 hover:shadow-md",
          "active:scale-[0.98]",
        ].join(" "),
        "site-outline": [
          "border-2 border-[var(--site-primary)] text-[var(--site-primary)]",
          "bg-transparent",
          "hover:bg-[var(--site-primary)] hover:text-white",
          "active:scale-[0.98]",
        ].join(" "),
        "site-ghost": [
          "text-[var(--site-primary)]",
          "hover:bg-[var(--site-primary-10)]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6",
        xl: "h-12 px-8 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Loading state */
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
