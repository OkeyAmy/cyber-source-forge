import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, ExternalLink, Shield, Info } from 'lucide-react';
import { SourceReference } from '@/types/chatTypes';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SourcesPanelProps {
  sources: SourceReference[];
  className?: string;
}

function SourcesPanel({ sources, className }: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasVerifiedSources = sources.some(source => source.verified);
  const verifiedCount = sources.filter(source => source.verified).length;
  
  // Group sources by source type and verification status
  const groupedSources = sources.reduce((acc, source) => {
    const sourceType = source.source || 'Web';
    if (!acc[sourceType]) {
      acc[sourceType] = [];
    }
    acc[sourceType].push(source);
    return acc;
  }, {} as Record<string, SourceReference[]>);
  
  const sourceCategories = Object.keys(groupedSources);
  
  // Safety check - ensure sources is an array and not empty
  if (!Array.isArray(sources) || sources.length === 0) {
    console.log('No sources to display in SourcesPanel');
    return null;
  }
  
  return (
    <div 
      className={cn(
        "bg-gray-800/60 rounded-lg border border-cyber-green/20 p-3 animate-fadeIn",
        hasVerifiedSources && "border-cyber-green/30",
        className
      )}
      role="region"
      aria-label="Source references"
      style={{ position: 'relative', zIndex: 1 }} // Ensure it doesn't overlap user messages
    >
      {/* Header with source count and expand/collapse control */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {hasVerifiedSources ? (
            <Shield className="h-4 w-4 text-cyber-green" />
          ) : (
            <Sparkles className="h-4 w-4 text-cyber-green" />
          )}
          <span className="text-sm font-medium text-white flex items-center gap-1.5">
            {sources.length} {sources.length === 1 ? 'Source' : 'Sources'} 
            {verifiedCount > 0 && (
              <span className="text-xs bg-cyber-green/20 text-cyber-green px-1.5 py-0.5 rounded-full">
                {verifiedCount} verified
              </span>
            )}
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 rounded-full p-0 text-white/60 hover:text-white hover:bg-white/10">
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Sources are verified for credibility and relevance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-cyber-cyan hover:text-white hover:bg-white/10"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="sources-content"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              <span>Show All</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Source categories pills for quick filtering */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sourceCategories.map(category => (
          <Badge 
            key={category}
            variant="outline" 
            className="bg-cyber-green/10 text-cyber-green border-cyber-green/30 hover:border-cyber-green transition-colors"
          >
            {category} ({groupedSources[category].length})
          </Badge>
        ))}
      </div>
      
      {/* Expanded view shows all sources in a scrollable grid */}
      <div id="sources-content">
        {isExpanded ? (
          <ScrollArea className="max-h-[300px] pr-2">
            <div className="grid grid-cols-1 gap-2">
              {sources.map((source, idx) => (
                <SourceItem key={idx} source={source} index={idx} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {sources.slice(0, 3).map((source, idx) => (
              <SourceItemCompact key={idx} source={source} index={idx} />
            ))}
            
            {sources.length > 3 && (
              <button 
                className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-cyber-green/10 rounded-lg border border-cyber-green/20 text-xs text-cyber-green cursor-pointer hover:bg-cyber-green/20 transition-colors"
                onClick={() => setIsExpanded(true)}
                aria-label={`Show ${sources.length - 3} more sources`}
              >
                +{sources.length - 3} more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceItem({ source, index }: { source: SourceReference; index: number }) {
  return (
    <a 
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyber-green/30 transition-colors flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-cyber-green/40 focus:border-transparent"
      aria-label={`Source ${index + 1}: ${source.title} - ${source.verified ? 'Verified' : 'Unverified'}`}
    >
      <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center">
        {source.verified ? (
          <Shield className="h-4 w-4 text-cyber-green" />
        ) : (
          <Sparkles className="h-4 w-4 text-cyber-cyan" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs bg-cyber-green/20 text-cyber-green px-1.5 py-0.5 rounded">
            {source.source || 'Web'}
          </span>
          {source.verified && (
            <span className="text-xs bg-cyber-green/10 text-cyber-green px-1.5 py-0.5 rounded flex items-center">
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              Verified
            </span>
          )}
        </div>
        <h5 className="text-sm font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors">{source.title}</h5>
        <div className="flex items-center text-xs text-cyber-cyan mt-1 group-hover:text-cyber-cyan/80 transition-colors">
          <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{source.url}</span>
        </div>
      </div>
    </a>
  );
}

function SourceItemCompact({ source, index }: { source: SourceReference; index: number }) {
  return (
    <a 
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-[180px] p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-cyber-green/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-cyber-green/40 focus:border-transparent"
      aria-label={`Source ${index + 1}: ${source.title} - ${source.verified ? 'Verified' : 'Unverified'}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs bg-cyber-green/20 text-cyber-green px-1.5 py-0.5 rounded">
          {source.source || 'Web'}
        </span>
        {source.verified && (
          <Shield className="h-3 w-3 text-cyber-green" />
        )}
      </div>
      <h5 className="text-sm font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors">{source.title}</h5>
      <div className="flex items-center text-xs text-cyber-cyan mt-1 group-hover:text-cyber-cyan/80 transition-colors">
        <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
        <span className="truncate">{new URL(source.url).hostname}</span>
      </div>
    </a>
  );
}

export default SourcesPanel; 