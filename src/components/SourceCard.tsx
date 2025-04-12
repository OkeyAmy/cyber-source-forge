import React from 'react';
import { ExternalLink, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceType } from '@/types/chatTypes';

interface SourceCardProps {
  source: SourceType;
  isExpanded?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showPreview?: boolean;
  onClick?: (source: SourceType) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ 
  source, 
  isExpanded = false, 
  className,
  size = 'medium',
  showPreview = false,
  onClick
}) => {
  const { 
    title, 
    link, 
    source: sourceType, 
    preview, 
    verified = Math.random() > 0.3 // Random for demo
  } = source;

  // Generate source type class
  const getSourceTypeClass = (type: string): string => {
    type = type.toLowerCase();
    if (type.includes('web')) return 'source-type-web';
    if (type.includes('news')) return 'source-type-news';
    if (type.includes('academic')) return 'source-type-academic';
    if (type.includes('reddit')) return 'source-type-reddit';
    if (type.includes('twitter')) return 'source-type-twitter';
    return '';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(source);
    }
  };

  const cardClasses = cn(
    "source-card",
    {
      "cursor-pointer hover:shadow-lg": !!onClick,
      "w-[220px]": size === 'small',
      "w-[280px]": size === 'medium',
      "w-full": size === 'large'
    },
    className
  );

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
    >
      {/* Header with verification status */}
      <div className="flex items-start justify-between mb-2">
        <span className={verified ? "verified-badge" : "unverified-badge"}>
          {verified ? (
            <>
              <ShieldCheck className="h-3 w-3" />
              <span>Verified</span>
            </>
          ) : (
            <>
              <ShieldX className="h-3 w-3" />
              <span>Unverified</span>
            </>
          )}
        </span>
        <span className={cn("source-type", getSourceTypeClass(sourceType))}>
          {sourceType}
        </span>
      </div>
      
      {/* Source title */}
      <h3 className="source-card-title">{title}</h3>
      
      {/* Source snippet - conditionally show based on showPreview */}
      {(showPreview || size === 'large') && (
        <p className="source-card-snippet">{preview}</p>
      )}
      
      {/* Footer with link */}
      <div className="source-card-footer">
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View Source
        </a>
        
        {/* Blockchain data visualization */}
        <div className="flex items-center space-x-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "data-block", 
                verified ? "data-block-verified" : "data-block-unverified"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SourceCard;
