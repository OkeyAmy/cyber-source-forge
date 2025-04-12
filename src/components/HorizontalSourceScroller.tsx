import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Link, Database, ExternalLink } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';
import SourceCard from './SourceCard';
import { Button } from './ui/button';

interface HorizontalSourceScrollerProps {
  sources: SourceType[];
  title?: string;
  onSourceClick?: (source: SourceType) => void;
  onViewAllClick?: () => void;
}

const HorizontalSourceScroller: React.FC<HorizontalSourceScrollerProps> = ({ 
  sources, 
  title = "Sources", 
  onSourceClick,
  onViewAllClick
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(true);
  
  // Improved scroll left function with better distance calculation
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      // Scroll by 80% of container width for better UX
      scrollContainerRef.current.scrollBy({ 
        left: -Math.floor(containerWidth * 0.8), 
        behavior: 'smooth' 
      });
    }
  };
  
  // Improved scroll right function with better distance calculation
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      // Scroll by 80% of container width for better UX
      scrollContainerRef.current.scrollBy({ 
        left: Math.floor(containerWidth * 0.8), 
        behavior: 'smooth' 
      });
    }
  };
  
  // Update scroll indicators with debouncing
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    // Add a small threshold for better UX
    setShowLeftIndicator(scrollLeft > 10);
    // Ensure the right indicator disappears only when we've scrolled all the way
    setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  // Throttled scroll handler for better performance
  const throttledScrollHandler = () => {
    let isScrolling: NodeJS.Timeout;
    return () => {
      // Clear timeout if it exists
      window.clearTimeout(isScrolling);
      // Set a timeout to run after scrolling ends
      isScrolling = setTimeout(() => {
        handleScroll();
      }, 100);
    };
  };
  
  // Check if indicators should be shown when sources change
  useEffect(() => {
    // setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowRightIndicator(scrollWidth > clientWidth + 10);
        handleScroll();
      }
    }, 100);
  }, [sources]);
  
  // Listen for scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const throttled = throttledScrollHandler();
      container.addEventListener('scroll', throttled);
      // Also check on resize
      window.addEventListener('resize', throttled);
      return () => {
        container.removeEventListener('scroll', throttled);
        window.removeEventListener('resize', throttled);
      };
    }
  }, []);
  
  if (!sources || sources.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-cyber-cyan flex items-center">
          <Link className="w-3 h-3 mr-1 text-cyber-green" />
          <span>{title} ({sources.length})</span>
        </h3>
        <div className="flex items-center space-x-2">
          {onViewAllClick && (
            <Button
              variant="link"
              size="sm"
              className="text-xs text-cyber-cyan p-0 h-auto flex items-center gap-1"
              onClick={onViewAllClick}
            >
              <Database className="w-3 h-3" />
              <span>All Sources</span>
            </Button>
          )}
          <div className="flex space-x-1">
            <button 
              onClick={scrollLeft}
              className={`bg-cyber-dark/80 p-1 rounded-full hover:bg-cyber-dark hover:border-cyber-green/30 border border-white/10 transition-all duration-200 ${!showLeftIndicator ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              aria-label="Scroll left"
              disabled={!showLeftIndicator}
            >
              <ChevronLeft className="w-4 h-4 text-cyber-green" />
            </button>
            <button 
              onClick={scrollRight}
              className={`bg-cyber-dark/80 p-1 rounded-full hover:bg-cyber-dark hover:border-cyber-green/30 border border-white/10 transition-all duration-200 ${!showRightIndicator ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              aria-label="Scroll right"
              disabled={!showRightIndicator}
            >
              <ChevronRight className="w-4 h-4 text-cyber-green" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Source cards */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar"
        style={{ 
          scrollBehavior: 'smooth', 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { 
            display: none; 
          }
          .hide-scrollbar { 
            scrollbar-width: none; 
            -ms-overflow-style: none; 
          }
        `}</style>
        {sources.map((source, index) => (
          <SourceCard 
            key={index} 
            source={source}
            size="small"
            showPreview={true}
            onClick={onSourceClick ? () => onSourceClick(source) : undefined}
            className="flex-shrink-0 animate-fade-in"
          />
        ))}
      </div>
      
      {/* Scroll indicators */}
      {showLeftIndicator && (
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cyber-dark/90 to-transparent pointer-events-none flex items-center">
          <div className="h-8 w-8 bg-cyber-dark/50 rounded-full flex items-center justify-center animate-pulse ml-1">
            <ChevronLeft className="h-5 w-5 text-cyber-green opacity-80" />
          </div>
        </div>
      )}
      {showRightIndicator && (
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cyber-dark/90 to-transparent pointer-events-none flex items-center justify-end">
          <div className="h-8 w-8 bg-cyber-dark/50 rounded-full flex items-center justify-center animate-pulse mr-1">
            <ChevronRight className="h-5 w-5 text-cyber-green opacity-80" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalSourceScroller;
