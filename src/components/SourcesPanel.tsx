import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, ExternalLink, Shield, Info, AlertTriangle, BookOpen, Globe } from 'lucide-react';
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

// Define the SourceItem component before using it
function SourceItem({ source, index }: { source: SourceReference; index: number }) {
  const sourceUrl = source.link || '#';
  
  // Get appropriate icon based on source type
  const getSourceIcon = (sourceType: string) => {
    switch(sourceType.toLowerCase()) {
      case 'academic': return <BookOpen className="h-4 w-4 text-blue-400" />;
      case 'web': return <Globe className="h-4 w-4 text-cyan-400" />;
      default: return <ExternalLink className="h-4 w-4 text-white/70" />;
    }
  };
  
  return (
    <a 
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyber-green/20 transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-cyber-green/30 shadow-md"
      aria-label={`Source ${index + 1}: ${source.title} - ${source.verified ? 'Verified' : 'Unverified'}`}
    >
      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
        {source.verified ? (
          <Shield className="h-4 w-4 text-cyber-green" />
        ) : (
          getSourceIcon(source.source)
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <Badge 
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-5 mr-1 ${
              source.source === 'Academic' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 
              source.source === 'Reddit' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 
              'bg-white/10 text-white/70 border-white/10'
            }`}
          >
            {source.source}
          </Badge>
          
          {source.verified ? (
            <span className="text-[10px] flex items-center text-cyber-green">
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              Verified
            </span>
          ) : (
            <span className="text-[10px] flex items-center text-amber-400">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Unverified
            </span>
          )}
        </div>
        <h5 className="text-sm font-medium text-white/90 line-clamp-2 group-hover:text-white transition-colors">{source.title}</h5>
        <div className="flex items-center text-xs text-cyber-cyan mt-2 group-hover:text-cyber-cyan transition-colors">
          <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{sourceUrl}</span>
        </div>
      </div>
    </a>
  );
}

// Define the SourceItemCompact component before using it
function SourceItemCompact({ source, index }: { source: SourceReference; index: number }) {
  const sourceUrl = source.link || '#';
  
  const getBgClass = (sourceType: string) => {
    if (source.verified) return 'from-cyber-green/5 to-cyber-green/10 border-cyber-green/30';
    if (sourceType === 'Academic') return 'from-blue-500/10 to-blue-900/20 border-blue-500/20';
    if (sourceType === 'Reddit') return 'from-orange-500/10 to-orange-900/20 border-orange-500/20';
    return 'from-gray-800/40 to-gray-900/40 border-white/10';
  };

  return (
    <a 
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex-shrink-0 w-[200px] h-[120px] p-3 rounded-xl border transition-all group focus:outline-none focus:ring-2 focus:ring-cyber-green/30 shadow-md hover:shadow-lg relative overflow-hidden bg-gradient-to-b",
        getBgClass(source.source),
        source.verified && "border-cyber-green/30"
      )}
      aria-label={`Source ${index + 1}: ${source.title} - ${source.verified ? 'Verified' : 'Unverified'}`}
    >
      {/* Verified badge - top right corner */}
      {source.verified && (
        <div className="absolute top-2 right-2 bg-cyber-green/20 rounded-full p-1 border border-cyber-green/30">
          <Shield className="h-3 w-3 text-cyber-green" />
        </div>
      )}
      
      {/* Source category */}
      <Badge 
        variant="outline" 
        className={cn(
          "text-[10px] px-1.5 py-0 h-4 border-opacity-30",
          source.source === 'Academic' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 
          source.source === 'Reddit' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 
          'bg-white/10 text-white/70 border-white/10'
        )}
      >
        {source.source}
      </Badge>
      
      {/* Title */}
      <h5 className="text-sm font-medium text-white mt-2 line-clamp-2 group-hover:text-white">{source.title}</h5>
      
      {/* Preview */}
      <p className="text-[10px] text-white/60 mt-2 line-clamp-2">{source.preview}</p>
      
      {/* Link indicator */}
      <div className="absolute bottom-2 right-2 text-cyber-cyan opacity-80 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="h-3 w-3" />
      </div>
    </a>
  );
}

// The SourcesPanel component can now properly reference the above components
function SourcesPanel({ sources, className }: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if we have any verified sources
  const verifiedCount = sources.filter(s => s.verified).length;
  const hasVerifiedSources = verifiedCount > 0;
  
  // Get unique source categories
  const sourceCategories = Array.from(new Set(sources.map(s => s.source)));
  
  // Group sources by category
  const groupedSources = sources.reduce((acc, source) => {
    const category = source.source;
    if (!acc[category]) acc[category] = [];
    acc[category].push(source);
    return acc;
  }, {} as Record<string, SourceReference[]>);
  
  return (
    <div 
      className={cn(
        "bg-gradient-to-b from-gray-800/60 to-gray-900/60 rounded-xl border border-white/10 p-4 backdrop-blur-sm shadow-lg animate-fadeIn",
        hasVerifiedSources && "border-cyber-green/20",
        className
      )}
      role="region"
      aria-label="Source references"
    >
      {/* Header with source count and expand/collapse control */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {hasVerifiedSources ? (
            <div className="w-6 h-6 rounded-full bg-cyber-green/20 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-cyber-green" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-white flex items-center gap-1.5">
              {sources.length} {sources.length === 1 ? 'Source' : 'Sources'} 
            </span>
            <span className="text-xs text-white/50">
              {verifiedCount > 0 ? `${verifiedCount} verified` : 'No verified sources'}
            </span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0 text-white/60 hover:text-white hover:bg-white/10 ml-1">
                  <Info className="h-3.5 w-3.5" />
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
          className="h-8 px-3 py-1 text-xs text-cyber-cyan hover:text-cyber-cyan hover:bg-cyber-cyan/10 rounded-lg transition-all"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="sources-content"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
              <span>Show All</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Source categories pills for quick filtering */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sourceCategories.map(category => {
          // Define color scheme based on category
          const getScheme = (cat: string) => {
            switch(cat.toLowerCase()) {
              case 'reddit': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
              case 'academic': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
              case 'news': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
              case 'web': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
              default: return 'bg-white/10 text-white/80 border-white/20';
            }
          };
          
          return (
            <Badge 
              key={category}
              variant="outline" 
              className={cn(
                "font-medium text-xs px-3 py-0.5 rounded-full shadow-sm", 
                getScheme(category)
              )}
            >
              {category} ({groupedSources[category].length})
            </Badge>
          );
        })}
      </div>
      
      {/* Expanded view shows all sources in a scrollable grid */}
      <div id="sources-content">
        {isExpanded ? (
          <div className="space-y-3">
            {/* Section title */}
            <h4 className="text-xs font-medium text-white/60 ml-1 mt-2">All Sources</h4>
            
            {/* Scrollable grid of sources */}
            <ScrollArea className="max-h-[350px] pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((source, idx) => (
                  <SourceItem key={idx} source={source} index={idx} />
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Horizontal scrolling sources */}
            <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar">
              {sources.slice(0, 4).map((source, idx) => (
                <SourceItemCompact key={idx} source={source} index={idx} />
              ))}
              
              {sources.length > 4 && (
                <button 
                  className="flex-shrink-0 flex flex-col items-center justify-center w-[140px] h-[120px] bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-cyber-green/30 text-sm text-white/80 cursor-pointer transition-colors shadow-md"
                  onClick={() => setIsExpanded(true)}
                  aria-label={`Show ${sources.length - 4} more sources`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-2">
                    <ChevronDown className="h-5 w-5 text-cyber-green" />
                  </div>
                  <span>{sources.length - 4} more</span>
                  <span className="text-xs text-white/50 mt-0.5">sources</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default SourcesPanel;