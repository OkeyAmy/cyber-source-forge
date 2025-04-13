import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Define grid variants using class-variance-authority
const gridVariants = cva(
  // Base styles for all grids
  "grid w-full gap-4",
  {
    variants: {
      // Column configurations for different screen sizes
      cols: {
        '1': 'grid-cols-1',
        '2': 'grid-cols-1 sm:grid-cols-2',
        '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        '6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        'auto-fill': 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
        'auto-fit': 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
      },
      // Gap spacing options
      gap: {
        '1': 'gap-1',
        '2': 'gap-2',
        '3': 'gap-3',
        '4': 'gap-4',
        '5': 'gap-5',
        '6': 'gap-6',
        '8': 'gap-8',
        '10': 'gap-10',
      },
      // Vertical gap spacing options (row-gap)
      rowGap: {
        '1': 'row-gap-1',
        '2': 'row-gap-2',
        '3': 'row-gap-3',
        '4': 'row-gap-4',
        '5': 'row-gap-5',
        '6': 'row-gap-6',
        '8': 'row-gap-8',
        '10': 'row-gap-10',
      },
      // Horizontal gap spacing options (column-gap)
      colGap: {
        '1': 'col-gap-1',
        '2': 'col-gap-2',
        '3': 'col-gap-3',
        '4': 'col-gap-4',
        '5': 'col-gap-5',
        '6': 'col-gap-6',
        '8': 'col-gap-8',
        '10': 'col-gap-10',
      },
      // Responsive behavior options
      responsive: {
        true: '', // Default responsive behavior is already handled by cols variant
        false: 'grid-cols-1', // Force single column layout for all screen sizes
      },
      // Flow direction options
      flow: {
        'row': 'grid-flow-row',
        'col': 'grid-flow-col',
        'dense': 'grid-flow-dense',
        'row-dense': 'grid-flow-row-dense',
        'col-dense': 'grid-flow-col-dense',
      },
      // Container padding options
      padding: {
        true: 'p-4',
        false: 'p-0',
      },
      // Center content within cells
      center: {
        true: 'place-items-center',
        false: '',
      },
    },
    // Default variant values
    defaultVariants: {
      cols: '3',
      gap: '4',
      responsive: true,
      padding: false,
      center: false,
    },
  }
);

// Grid props interface
export interface GridProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  // Custom min width for auto-fill/auto-fit columns
  minItemWidth?: string;
  // Make grid container full width of parent
  fullWidth?: boolean;
  // Container for the grid with optional padding
  container?: boolean;
  // Equal height for all grid items
  equalHeight?: boolean;
}

// Create the Grid component with forwardRef to allow ref passing
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className,
    cols,
    gap,
    rowGap,
    colGap,
    responsive,
    flow,
    padding,
    center,
    minItemWidth,
    fullWidth = true,
    container = false,
    equalHeight = false,
    style = {},
    children,
    ...props
  }, ref) => {
    // Combine custom styles with minItemWidth if provided
    const gridStyles = {
      ...(minItemWidth && {
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
      }),
      ...style,
    };

    // Container classes to control width and padding
    const containerClasses = container 
      ? 'container mx-auto px-4 md:px-6 lg:px-8' 
      : '';
    
    // Full width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Classes for equal height items
    const heightClasses = equalHeight ? 'grid-items-equal-height' : '';

    return (
      <div 
        ref={ref}
        className={`${gridVariants({ cols, gap, rowGap, colGap, responsive, flow, padding, center })} ${containerClasses} ${widthClasses} ${heightClasses} ${className}`}
        style={gridStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item component for consistent spacing and styling
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  // Column span for different breakpoints
  colSpan?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  // Row span for the item
  rowSpan?: number;
  // Make the grid item fill available height
  fillHeight?: boolean;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    className, 
    colSpan, 
    rowSpan,
    fillHeight = false,
    children,
    ...props 
  }, ref) => {
    // Generate column span classes for different breakpoints
    const colSpanClasses = colSpan 
      ? `${colSpan.sm ? `sm:col-span-${colSpan.sm}` : ''} 
         ${colSpan.md ? `md:col-span-${colSpan.md}` : ''} 
         ${colSpan.lg ? `lg:col-span-${colSpan.lg}` : ''} 
         ${colSpan.xl ? `xl:col-span-${colSpan.xl}` : ''}`
      : '';
    
    // Generate row span classes
    const rowSpanClasses = rowSpan ? `row-span-${rowSpan}` : '';
    
    // Classes for filling height
    const heightClasses = fillHeight ? 'h-full' : '';

    return (
      <div 
        ref={ref}
        className={`${colSpanClasses} ${rowSpanClasses} ${heightClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

// Export additional utility components
export const GridContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`container mx-auto px-4 md:px-6 lg:px-8 ${className}`}
      {...props}
    />
  )
);

GridContainer.displayName = 'GridContainer'; 