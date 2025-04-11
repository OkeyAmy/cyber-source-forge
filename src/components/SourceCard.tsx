import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  sourceIndex: number;
  title: string;
  link: string;
  source: string;
  preview: string;
  logo?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SourceCard: React.FC<SourceCardProps> = ({
  sourceIndex,
  title,
  link,
  source,
  preview,
  logo,
  isActive = false,
  onClick,
}) => {
  // Truncate title and preview for better display
  const truncatedTitle = title.length > 80 ? `${title.substring(0, 80)}...` : title;
  const truncatedPreview = preview.length > 240 ? `${preview.substring(0, 240)}...` : preview;
  
  // Generate source badge color based on source type
  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'reddit':
        return 'bg-orange-600/80 border-orange-500/30';
      case 'twitter':
        return 'bg-blue-500/80 border-blue-400/30';
      case 'web':
        return 'bg-green-600/80 border-green-500/30';
      case 'news':
        return 'bg-red-600/80 border-red-500/30';
      case 'academic':
        return 'bg-purple-600/80 border-purple-500/30';
      default:
        return 'bg-cyber-green/80 border-cyber-green/30';
    }
  };
  
  // Handle card click with keyboard support
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick && onClick();
    }
  };
  
  // Handle source link click and stop propagation
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "relative group flex flex-col rounded-md overflow-hidden border transition-all duration-300",
        "bg-black/60 backdrop-blur-sm hover:bg-black/80",
        "border-white/5 hover:border-cyber-accent/50",
        isActive ? "ring-1 ring-cyber-accent shadow-glow-sm" : "shadow-md hover:shadow-glow-xs",
        "cursor-pointer"
      )}
      onClick={onClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`Source ${sourceIndex}: ${title}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-black/60 to-transparent">
        {/* Source number and type */}
        <div className="flex items-center gap-2">
          {/* Source number indicator */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 border border-white/10 text-xs font-mono">
            {sourceIndex}
          </div>
          
          {/* Source badge */}
          <div className={cn(
            "text-xs px-2 py-0.5 rounded-sm font-medium border",
            getSourceBadgeColor(source)
          )}>
            {source}
          </div>
        </div>
        
        {/* External link button */}
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-cyber-accent/20 transition-colors"
          onClick={handleLinkClick}
          aria-label={`Open ${title} in new tab`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      
      {/* Card Content */}
      <div className="flex-1 p-3 flex flex-col gap-3">
        {/* Title with logo if available */}
        <div className="flex items-start gap-2">
          {logo && (
            <img 
              src={logo} 
              alt="" 
              className="w-4 h-4 mt-1 rounded-full object-cover" 
              loading="lazy"
            />
          )}
          <h3 className="text-sm font-medium text-white/90 leading-tight">
            {truncatedTitle}
          </h3>
        </div>
        
        {/* Preview text */}
        <p className="text-xs text-white/70 leading-relaxed">
          {truncatedPreview}
        </p>
      </div>
      
      {/* Card hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-accent/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
    </div>
  );
};

export default SourceCard;
