
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <button 
      className={cn(
        "fixed z-40 bg-cyber-dark/80 p-2 rounded-full shadow-lg border border-white/10 hover:border-[#00ff9d]/40 transition-all duration-300",
        position === 'left' ? 'left-4' : 'right-4',
        className
      )}
      onClick={onClick}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {position === 'left' ? (
        isCollapsed ? 
          <ChevronRight className="text-cyber-green w-4 h-4" /> : 
          <ChevronLeft className="text-cyber-green w-4 h-4" />
      ) : (
        isCollapsed ? 
          <ChevronLeft className="text-cyber-green w-4 h-4" /> : 
          <ChevronRight className="text-cyber-green w-4 h-4" />
      )}
    </button>
  );
};

export default SidebarTrigger;
