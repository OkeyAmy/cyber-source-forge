
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type SidebarTriggerProps = {
  isCollapsed?: boolean;
  isOpen?: boolean; // Added support for isOpen prop
  onClick: () => void;
  position?: 'left' | 'right';
  className?: string;
};

const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ 
  isCollapsed, 
  isOpen,
  onClick, 
  position = 'left', // Default to left 
  className 
}) => {
  const isMobile = useIsMobile();
  
  // Support both isCollapsed and isOpen props for backwards compatibility
  const collapsed = isCollapsed !== undefined ? isCollapsed : !isOpen;
  
  return (
    <button 
      className={cn(
        "sidebar-trigger-visible z-40 flex items-center justify-center transition-all duration-300",
        position === 'left' 
          ? collapsed ? 'left-4 md:left-6' : 'left-[16rem] md:left-[16.5rem]' 
          : collapsed ? 'right-4 md:right-6' : 'right-[18rem] md:right-[18.5rem]',
        isMobile ? (
          collapsed ? 'fixed bottom-16' : 'hidden'
        ) : (
          'fixed top-24'
        ),
        className
      )}
      onClick={onClick}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {position === 'left' ? (
        collapsed ? 
          <ChevronRight className="text-cyber-green w-4 h-4 md:w-5 md:h-5" /> : 
          <ChevronLeft className="text-cyber-green w-4 h-4 md:w-5 md:h-5" />
      ) : (
        collapsed ? 
          <ChevronLeft className="text-cyber-green w-4 h-4 md:w-5 md:h-5" /> : 
          <ChevronRight className="text-cyber-green w-4 h-4 md:w-5 md:h-5" />
      )}
    </button>
  );
};

export default SidebarTrigger;
