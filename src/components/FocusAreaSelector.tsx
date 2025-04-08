
import React from 'react';
import { cn } from '@/lib/utils';

type FocusArea = 'All' | 'Research' | 'Social';

interface FocusAreaSelectorProps {
  selected: FocusArea;
  onChange: (area: FocusArea) => void;
  className?: string;
}

const FocusAreaSelector: React.FC<FocusAreaSelectorProps> = ({ 
  selected, 
  onChange,
  className 
}) => {
  const areas: Array<{ id: FocusArea; label: string; sources: string[] }> = [
    { id: 'All', label: 'All Sources', sources: ['Reddit', 'Twitter', 'Web', 'News', 'Academic'] },
    { id: 'Research', label: 'Research', sources: ['News', 'Academic', 'Web'] },
    { id: 'Social', label: 'Social', sources: ['Reddit', 'Twitter', 'Web'] },
  ];
  
  return (
    <div className={cn("flex space-x-2 mb-4", className)}>
      {areas.map((area) => (
        <button
          key={area.id}
          className={cn(
            "px-3 py-1.5 text-xs rounded-full border transition-colors duration-200",
            selected === area.id 
              ? "border-cyber-green bg-cyber-green/20 text-cyber-green" 
              : "border-white/10 bg-cyber-dark/40 text-white/70 hover:bg-cyber-dark/60 hover:border-white/20"
          )}
          onClick={() => onChange(area.id)}
        >
          {area.label}
          <span className="block text-[10px] opacity-70">
            {area.sources.join(', ')}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FocusAreaSelector;
