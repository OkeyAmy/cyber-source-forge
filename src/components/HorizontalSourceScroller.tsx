
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SourceType } from './SourceCard';
import SourceCard from './SourceCard';

interface HorizontalSourceScrollerProps {
  sources: SourceType[];
  title?: string;
  onSourceClick?: (source: SourceType) => void;
}

const HorizontalSourceScroller: React.FC<HorizontalSourceScrollerProps> = ({ 
  sources, 
  title = "Sources for this request", 
  onSourceClick 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  if (!sources || sources.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full my-4 relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-white/70">{title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={scrollLeft}
            className="bg-cyber-dark/80 p-1 rounded-full hover:bg-cyber-dark hover:border-cyber-green/30 border border-white/10 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-cyber-green" />
          </button>
          <button 
            onClick={scrollRight}
            className="bg-cyber-dark/80 p-1 rounded-full hover:bg-cyber-dark hover:border-cyber-green/30 border border-white/10 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 text-cyber-green" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-cyber-green"
        style={{ scrollBehavior: 'smooth' }}
      >
        {sources.map((source, index) => (
          <SourceCard 
            key={index} 
            source={source}
            size="small"
            onClick={() => onSourceClick?.(source)}
            className="flex-shrink-0 cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
};

export default HorizontalSourceScroller;
