import * as React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarTriggerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const SidebarTrigger: React.FC<SidebarTriggerProps> = ({
  isOpen,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-lg p-2 transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-accent/50 focus-visible:ring-offset-1",
        "hover:bg-white/5 active:bg-white/10",
        isOpen ? "bg-black/30" : "bg-transparent",
        className
      )}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
      aria-controls="sidebar"
    >
      <div className="relative w-5 h-5">
        {/* Animated menu icon */}
        <span 
          className={cn(
            "absolute block h-0.5 bg-white/80 rounded-full w-5 transition-all duration-300",
            isOpen ? "rotate-45 top-2.5" : "top-1"
          )}
        />
        <span 
          className={cn(
            "absolute block h-0.5 bg-white/80 rounded-full w-3 top-2.5 transition-all duration-300",
            isOpen ? "opacity-0 -translate-x-2" : "opacity-100"
          )}
        />
        <span 
          className={cn(
            "absolute block h-0.5 bg-white/80 rounded-full transition-all duration-300",
            isOpen ? "rotate-[-45deg] top-2.5 w-5" : "w-4 top-4"
          )}
        />
      </div>
      
      {/* Visual indicator for sidebar state */}
      <span className="sr-only">{isOpen ? "Close" : "Open"} sidebar</span>
    </button>
  );
};

export default SidebarTrigger;
