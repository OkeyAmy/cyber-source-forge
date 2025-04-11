import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Filter } from 'lucide-react';

export type SourceFilterType = 'Reddit' | 'Twitter' | 'Web' | 'News' | 'Academic' | 'All Sources';

interface FilterControlsProps {
  availableFilters: SourceFilterType[];
  activeFilter: SourceFilterType;
  onFilterChange: (filter: SourceFilterType) => void;
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  availableFilters,
  activeFilter,
  onFilterChange,
  className
}) => {
  // Helper for filter button appearance
  const getButtonStyles = (filter: SourceFilterType) => {
    const isActive = filter === activeFilter;
    
    let baseStyles = "text-xs py-1 px-3 rounded-md transition-all duration-200 flex items-center gap-1.5";
    
    if (isActive) {
      return cn(
        baseStyles,
        "bg-cyber-accent/20 text-white border border-cyber-accent/50 shadow-glow-xs font-medium"
      );
    }
    
    return cn(
      baseStyles,
      "bg-black/40 text-white/70 border border-white/10 hover:bg-black/60 hover:border-white/20"
    );
  };
  
  // Get color for filter by type
  const getFilterColor = (filter: SourceFilterType) => {
    switch (filter) {
      case 'Reddit': return 'text-orange-400';
      case 'Twitter': return 'text-blue-400';
      case 'Web': return 'text-green-400';
      case 'News': return 'text-red-400';
      case 'Academic': return 'text-purple-400';
      default: return 'text-white';
    }
  };
  
  // Get icon for filter indicators
  const getFilterIcon = (filter: SourceFilterType) => {
    // You can replace this with specific icons for each filter type if desired
    return <span className={cn("block w-2 h-2 rounded-full", getFilterColor(filter))}></span>;
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Source filters">
      {availableFilters.map((filter) => (
        <Button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={getButtonStyles(filter)}
          aria-pressed={filter === activeFilter}
          type="button"
        >
          {filter === activeFilter ? (
            <Check className="h-3 w-3" />
          ) : (
            getFilterIcon(filter)
          )}
          <span>{filter}</span>
        </Button>
      ))}
    </div>
  );
};

export default FilterControls; 