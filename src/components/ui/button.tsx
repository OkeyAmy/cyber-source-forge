import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

// Enhanced button variants with improved hover effects and transitions
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        cyber: "bg-cyber-green text-cyber-dark shadow-lg shadow-cyber-green/20 hover:bg-cyber-green/90 hover:shadow-cyber-green/30 active:scale-[0.98]",
        glow: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-[0_0_15px_rgba(var(--primary-rgb)/0.5)] hover:shadow-[0_0_25px_rgba(var(--primary-rgb)/0.65)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-13 rounded-md px-10 text-base",
        xxl: "h-15 rounded-md px-12 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      rounded: "default",
    },
  }
)

// Expanded Button props interface with enhanced features
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // Loading state for the button 
  isLoading?: boolean
  // Loading text to display when button is in loading state
  loadingText?: string
  // Left icon component
  leftIcon?: React.ReactNode
  // Right icon component
  rightIcon?: React.ReactNode
  // Elevate the button with shadow
  elevated?: boolean
  // Add ripple effect on click
  withRipple?: boolean
  // Animation type for the button
  animation?: 'none' | 'pulse' | 'bounce' | 'spin'
}

// Enhanced Button component with improved accessibility and features
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    rounded,
    asChild = false,
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    elevated = false,
    withRipple = false,
    animation = 'none',
    children,
    ...props 
  }, ref) => {
    // State for ripple effect
    const [ripples, setRipples] = React.useState<{x: number, y: number, size: number}[]>([]);
    // Ref for the button element
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    
    // Merge refs for button reference
    const mergedRef = React.useMemo(() => {
      return (node: HTMLButtonElement) => {
        buttonRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      };
    }, [ref]);
    
    // Function to create ripple effect
    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!withRipple || !buttonRef.current) return;
      
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const size = Math.max(rect.width, rect.height) * 2;
      
      setRipples([...ripples, { x, y, size }]);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 600);
    };
    
    // Calculate animation classes based on animation prop
    const animationClasses = React.useMemo(() => {
      switch (animation) {
        case 'pulse':
          return 'animate-pulse';
        case 'bounce':
          return 'animate-bounce';
        case 'spin':
          return 'animate-spin';
        default:
          return '';
      }
    }, [animation]);
    
    // Calculate shadow classes based on elevated prop
    const shadowClasses = elevated ? 'shadow-lg hover:shadow-xl' : '';
    
    // Determine the component to render
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        ref={mergedRef}
        className={cn(
          buttonVariants({ variant, size, fullWidth, rounded, className }),
          shadowClasses,
          animationClasses,
          "relative overflow-hidden",
          isLoading && "opacity-80 cursor-not-allowed"
        )}
        disabled={isLoading || props.disabled}
        onClick={(e) => {
          if (!isLoading && props.onClick) {
            if (withRipple) createRipple(e);
            props.onClick(e);
          }
        }}
        // Enhanced keyboard navigation
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isLoading && props.onClick) {
              props.onClick(e as any);
            }
          }
          if (props.onKeyDown) {
            props.onKeyDown(e);
          }
        }}
        aria-busy={isLoading}
        aria-disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}
        
        {/* Button content - show loading text if provided and loading */}
        {isLoading && loadingText ? loadingText : children}
        
        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
        
        {/* Ripple effect elements */}
        {withRipple && ripples.map((ripple, i) => (
          <span
            key={i}
            className="absolute bg-white/30 rounded-full animate-ripple"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
            aria-hidden="true"
          />
        ))}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
