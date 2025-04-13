import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Card variants for consistent styling across the application
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border shadow-sm",
        outline: "border border-border",
        filled: "bg-accent/40 border-none",
        elevated: "shadow-lg hover:shadow-xl border-none",
        interactive: "cursor-pointer hover:-translate-y-1 hover:shadow-md",
      },
      size: {
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
)

// Card props interface with enhanced features
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  // Optional card title
  title?: string
  // Whether the card is focusable
  focusable?: boolean
  // Enable hover effects for the card
  hoverEffect?: boolean
  // Loading state for the card
  loading?: boolean
  // Number of skeleton lines to show when loading
  skeletonLines?: number
}

// Main Card component with various features
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    title,
    focusable = false,
    hoverEffect = false,
    loading = false,
    skeletonLines = 3,
    children,
    ...props 
  }, ref) => {
    // Handle hover effect classes
    const hoverEffectClass = hoverEffect ? 
      "transform transition-transform hover:-translate-y-1 hover:shadow-md" : "";
    
    // Handle keyboard interactions for focusable cards
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (focusable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (props.onClick) {
          props.onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, fullWidth }),
          hoverEffectClass,
          focusable && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        tabIndex={focusable ? 0 : undefined}
        role={focusable ? "button" : undefined}
        aria-busy={loading}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Loading state with skeleton UI */}
        {loading ? (
          <div className="space-y-3">
            {title && (
              <div className="h-5 w-2/3 rounded-md bg-muted animate-pulse"></div>
            )}
            {Array.from({ length: skeletonLines }).map((_, index) => (
              <div 
                key={index} 
                className={`h-4 rounded-md bg-muted animate-pulse ${
                  index === skeletonLines - 1 ? "w-1/2" : "w-full"
                }`} 
                style={{ 
                  animationDelay: `${index * 100}ms` 
                }}
              ></div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    )
  }
)
Card.displayName = "Card"

// Card Header component for consistent header styling
const CardHeader = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Card Title component with proper heading semantics
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Card Description component for secondary text
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// Card Content component for main content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// Card Footer component for actions or additional information
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
