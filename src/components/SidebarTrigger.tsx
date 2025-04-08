
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
        "sidebar-trigger-visible z-40 flex items-center justify-center transition-all duration-300",
        position === 'left' 
          ? isCollapsed ? 'left-4 md:left-6' : 'left-[16rem] md:left-[16.5rem]' 
          : isCollapsed ? 'right-4 md:right-6' : 'right-[18rem] md:right-[18.5rem]',
        isMobile ? (
          isCollapsed ? 'fixed bottom-16' : 'hidden'
        ) : (
          'fixed top-24'
        ),
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
