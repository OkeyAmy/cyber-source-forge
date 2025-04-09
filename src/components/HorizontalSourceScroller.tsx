
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Link } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';
import SourceCard from './SourceCard';

interface HorizontalSourceScrollerProps {
  sources: SourceType[];
  title?: string;
  onSourceClick?: (source: SourceType) => void;
}

const HorizontalSourceScroller: React.FC<HorizontalSourceScrollerProps> = ({ 
  sources, 
  title = "Sources", 
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
        <h3 className="text-xs text-white/70 flex items-center">
          <Link className="w-3 h-3 mr-1 text-cyber-green" />
          <span>{title} ({sources.length})</span>
        </h3>
        <div className="flex space-x-1">
          <button 
            onClick={scrollLeft}
            className="bg-cyber-dark/80 p-1 rounded-full hover:bg-cyber-dark hover:border-cyber-green/30 border border-white/10 transition-colors duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-cyber-green" />
          </button>
          <button 
            onClick={scrollRight}
            className="bg-cyber-dark/80 p-1 rounded-full hover:bg-cyber-dark hover:border-cyber-green/30 border border-white/10 transition-colors duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-cyber-green" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar"
        style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <style>
          {`.hide-scrollbar::-webkit-scrollbar { display: none; }`}
        </style>
        {sources.map((source, index) => (
          <SourceCard 
            key={index} 
            source={source}
            size="small"
            onClick={() => onSourceClick?.(source)}
            className={`flex-shrink-0 animate-fade-in`}
          />
        ))}
      </div>
      
      {/* Scroll indicators */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cyber-dark/80 to-transparent pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cyber-dark/80 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HorizontalSourceScroller;
