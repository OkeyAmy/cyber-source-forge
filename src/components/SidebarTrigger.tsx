
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type SidebarTriggerProps = {
  isCollapsed: boolean;
  onClick: () => void;
  position: 'left' | 'right';
  className?: string;
};

const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ 
  isCollapsed, 
  onClick, 
  position, 
  className 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <button 
      className={cn(
        "fixed z-40 bg-cyber-dark/80 p-2 rounded-full shadow-lg border border-white/10 hover:border-[#00ff9d]/40 transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,255,157,0.4)]",
        position === 'left' 
          ? 'left-4 md:left-6' 
          : 'right-4 md:right-6',
        isMobile ? 'bottom-16' : 'top-1/2 -translate-y-1/2',
        className
      )}
      onClick={onClick}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {position === 'left' ? (
        isCollapsed ? 
          <ChevronRight className="text-cyber-green w-4 h-4 md:w-5 md:h-5" /> : 
          <ChevronLeft className="text-cyber-green w-4 h-4 md:w-5 md:h-5" />
      ) : (
        isCollapsed ? 
          <ChevronLeft className="text-cyber-green w-4 h-4 md:w-5 md:h-5" /> : 
          <ChevronRight className="text-cyber-green w-4 h-4 md:w-5 md:h-5" />
      )}
    </button>
  );
};

export default SidebarTrigger;
