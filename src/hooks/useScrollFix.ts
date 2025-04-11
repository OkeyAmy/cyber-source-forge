import { useEffect, useRef, useCallback } from 'react';

/**
 * A hook to fix scrolling issues in the ScrollArea component
 * This provides functionality to properly scroll to the bottom of containers
 * with improved handling for different scroll behaviors
 */
export function useScrollFix() {
  // Store the scroll container references
  const containerRefs = useRef<Set<HTMLElement>>(new Set());
  
  // Function to fix scrolling for a specific element
  const fixScrollingForElement = useCallback((element: HTMLElement) => {
    if (!containerRefs.current.has(element)) {
      containerRefs.current.add(element);
    }
    
    // Apply critical styles for scrolling
    element.style.overflowY = 'auto';
    element.style.height = '100%';
    element.style.display = 'flex';
    element.style.flexDirection = 'column';
    element.style.overscrollBehavior = 'contain';
    element.style.touchAction = 'pan-y';
    // Apply for Safari/iOS support
    (element.style as any).WebkitOverflowScrolling = 'touch';
    
    // Ensure content takes full height
    const contentElement = element.firstElementChild;
    if (contentElement instanceof HTMLElement) {
      contentElement.style.minHeight = '100%';
      contentElement.style.display = 'flex';
      contentElement.style.flexDirection = 'column';
    }
  }, []);
  
  // Register a scroll container to be fixed
  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    fixScrollingForElement(element);
    
    // Also apply specific fixes for radix UI ScrollArea
    if (element.closest('[data-radix-scroll-area-root]')) {
      // Find the viewport element if this is inside a Radix ScrollArea
      const viewport = element.closest('[data-radix-scroll-area-viewport]');
      if (viewport && viewport instanceof HTMLElement) {
        fixScrollingForElement(viewport);
      }
    }
  }, [fixScrollingForElement]);
  
  // Smooth scroll to bottom function with retry mechanism
  const scrollToBottom = useCallback((options: { smooth?: boolean } = {}) => {
    const { smooth = true } = options;
    
    containerRefs.current.forEach(container => {
      // Try smooth scroll first
      if (smooth) {
        try {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        } catch (e) {
          // Fallback to instant scroll if smooth scroll fails
          container.scrollTop = container.scrollHeight;
        }
      } else {
        // Instant scroll
        container.scrollTop = container.scrollHeight;
      }
    });
    
    // Retry with a small delay to handle any race conditions
    setTimeout(() => {
      containerRefs.current.forEach(container => {
        container.scrollTop = container.scrollHeight;
      });
    }, 100);
  }, []);
  
  // Clear all refs on unmount
  useEffect(() => {
    return () => {
      containerRefs.current.clear();
    };
  }, []);
  
  return { registerScrollContainer, scrollToBottom, fixScrollingForElement };
} 