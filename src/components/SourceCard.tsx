import React from 'react';
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface SourceCardProps {
  source: SourceType;
  className?: string;
}

function SourceCard({ source, className }: SourceCardProps) {
  // Determine colors and styles based on source type and verification status
  const getBgClass = () => {
    if (source.verified) return 'border-cyber-green/30 from-cyber-green/5 to-transparent';
    
    switch(source.source?.toLowerCase()) {
      case 'academic':
        return 'border-blue-500/30 from-blue-500/5 to-transparent';
      case 'reddit':
        return 'border-orange-500/30 from-orange-500/5 to-transparent';
      case 'news':
        return 'border-purple-500/30 from-purple-500/5 to-transparent';
      case 'twitter':
        return 'border-blue-400/30 from-blue-400/5 to-transparent';
      default:
        return 'border-white/10 from-white/5 to-transparent';
    }
  };
  
  return (
    <div
      className={cn(
        "bg-gradient-to-b border rounded-xl p-4 shadow-md hover:shadow-lg transition-all",
        getBgClass(),
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Source verification icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          source.verified 
            ? "bg-cyber-green/10 border border-cyber-green/30" 
            : "bg-white/5 border border-white/10"
        )}>
          {source.verified ? (
            <Shield className="h-5 w-5 text-cyber-green" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Source type badge */}
          <Badge 
            variant="outline"
            className={cn(
              "mb-1.5 px-2 py-0.5 text-xs rounded-full border-opacity-30",
              source.source === 'Academic' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              source.source === 'Reddit' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              source.source === 'News' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
              source.source === 'Twitter' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
              'bg-white/10 text-white/70 border-white/10'
            )}
          >
            {source.source || "Web"}
          </Badge>

          {/* Source title */}
          <h3 className="text-white font-medium line-clamp-2 mb-2">{source.title}</h3>
          
          {/* Source preview */}
          <p className="text-white/70 text-sm line-clamp-3 mb-3">{source.preview}</p>
          
          {/* Link */}
          <div className="flex justify-between items-center mt-auto">
            <a 
              href={source.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-cyber-cyan flex items-center hover:underline"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Source
            </a>
            
            {/* Source number */}
            <span className="text-xs text-white/40">Source #{source.num}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SourceCard;
