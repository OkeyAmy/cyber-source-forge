import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartSuggestion } from '@/types/chatTypes';

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onSelect: (suggestion: SmartSuggestion) => void;
  className?: string;
}

export function SmartSuggestions({
  suggestions,
  onSelect,
  className = ''
}: SmartSuggestionsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  
  // Check if scroll indicators are needed
  const checkScrollIndicators = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setShowLeftScroll(container.scrollLeft > 20);
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 20
    );
  };
  
  // Scroll left
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
  };
  
  // Scroll right
  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
  };
  
  // Set up scroll event listeners and initial check
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkScrollIndicators);
    window.addEventListener('resize', checkScrollIndicators);
    
    // Initial check
    checkScrollIndicators();
    
    return () => {
      container.removeEventListener('scroll', checkScrollIndicators);
      window.removeEventListener('resize', checkScrollIndicators);
    };
  }, [suggestions]);
  
  // Update scroll indicators when suggestions change
  useEffect(() => {
    checkScrollIndicators();
  }, [suggestions]);
  
  // Get category-based styling
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'related':
        return 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20';
      case 'follow-up':
        return 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20';
      case 'clarification':
        return 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20';
      default:
        return 'bg-cyber-green/10 border-cyber-green/30 hover:bg-cyber-green/20';
    }
  };
  
  if (!suggestions.length) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Left scroll indicator */}
      {showLeftScroll && (
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-cyber-dark/80 text-white/80 rounded-full p-1 shadow-md z-10"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      {/* Suggestions container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto no-scrollbar flex space-x-2 py-2 px-1 scrollbar-thin scrollbar-thumb-cyber-green/20 scrollbar-track-transparent"
      >
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className={`whitespace-nowrap px-4 py-2 text-sm rounded-full border transition-all transform hover:scale-105 ${getCategoryStyle(suggestion.category)}`}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
      
      {/* Right scroll indicator */}
      {showRightScroll && (
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-cyber-dark/80 text-white/80 rounded-full p-1 shadow-md z-10"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
      
      <style jsx>{`
        /* Hide scrollbar but keep functionality */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
} 