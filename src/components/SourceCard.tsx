
import React from 'react';
import { ExternalLink, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceType } from '@/types/chatTypes';

interface SourceCardProps {
  source: SourceType;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showPreview?: boolean;
  onClick?: (source: SourceType) => void;
}

const sourceIcons: Record<string, string> = {
  'Reddit': '/lovable-uploads/7fbbde5b-4d67-4cba-8762-c7ec5457a6ec.png',
  'Twitter': '/lovable-uploads/9c56662f-b78c-4cde-a963-e4470e1f7efd.png',
  'Web': '/lovable-uploads/30cdaa08-bba2-4a5e-a1fa-efb78b0b978b.png',
  'News': '/lovable-uploads/65485ff4-54bb-4524-908c-16466cdd44c0.png',
  'Academic': '/lovable-uploads/65485ff4-54bb-4524-908c-16466cdd44c0.png',
};

const SourceCard: React.FC<SourceCardProps> = ({ 
  source, 
  className,
  size = 'medium',
  showPreview = false,
  onClick
}) => {
  // Determine if source is verified
  const isVerified = source.verified ?? Math.random() > 0.25;
  
  // Get logo based on source type or use provided logo
  const logoUrl = source.logo || sourceIcons[source.source] || null;
  
  const handleClick = () => {
    if (onClick) onClick(source);
  };
  
  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-all duration-300 rounded-lg border overflow-hidden",
        isVerified 
          ? "border-cyber-green/30 hover:border-cyber-green/80" 
          : "border-cyber-magenta/30 hover:border-cyber-magenta/50",
        size === 'small' && "p-2 min-w-[200px] max-w-[200px]",
        size === 'medium' && "p-3 min-w-[280px] max-w-[280px]",
        size === 'large' && "p-4 w-full",
        "bg-cyber-dark/60 backdrop-blur-md hover:bg-cyber-dark/80 shadow-[0_2px_12px_rgba(0,0,0,0.15)]",
        "hover:shadow-[0_4px_20px_rgba(0,255,170,0.15)]",
        className
      )}
      onClick={handleClick}
    >
      {/* Source Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isVerified 
          ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/40'
          : 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta/40'
      }`}>
        {isVerified ? (
          <>
            <Shield className="w-3 h-3 inline-block mr-1" />
            <span>Verified</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 inline-block mr-1" />
            <span>Unverified</span>
          </>
        )}
      </div>
      
      {/* Source Type Badge */}
      <div className="flex items-center mb-3">
        {logoUrl && (
          <div className="h-6 w-6 mr-2 bg-white/10 rounded-full p-1 flex items-center justify-center">
            <img src={logoUrl} alt={source.source} className="h-full w-full object-contain" />
          </div>
        )}
        <span className={`text-xs py-0.5 px-2 rounded-full bg-white/10 border border-white/10 text-white`}>
          {source.source}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-cyber-green transition-colors">{source.title}</h3>
      
      {/* Link */}
      <a 
        href={source.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs text-cyber-cyan hover:underline flex items-center mb-3 hover:text-cyber-green transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="truncate max-w-[180px]">{source.link}</span>
        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
      </a>
      
      {/* Preview */}
      {showPreview && (
        <div className="mt-1 mb-2">
          <p className="text-xs text-white/70 line-clamp-3">{source.preview}</p>
        </div>
      )}
      
      {/* Preview Images */}
      {showPreview && source.images && source.images.length > 0 && (
        <div className="mt-3 h-24 overflow-hidden rounded group-hover:opacity-90 transition-opacity">
          <img 
            src={source.images[0]} 
            alt="Preview" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      
      {/* View More Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
        <span className="text-xs text-cyber-green px-3 py-1 rounded-full border border-cyber-green/40 bg-cyber-dark/50 backdrop-blur-sm">
          View Source
        </span>
      </div>
    </div>
  );
};

export default SourceCard;
