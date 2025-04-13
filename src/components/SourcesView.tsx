import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface SourcesViewProps {
  sources: SourceType[];
  isLoading?: boolean;
}

const SourcesView: React.FC<SourcesViewProps> = ({ sources, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-2 p-4 border border-white/10 rounded-lg">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mb-4">
          <ExternalLink className="h-6 w-6 text-cyber-cyan opacity-60" />
        </div>
        <h3 className="text-lg font-medium text-white">No Sources Found</h3>
        <p className="text-sm text-white/60 mt-1 max-w-xs">
          When you ask a question, sources used to answer will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-3 p-3">
        {sources.map((source, index) => (
          <div 
            key={`${source.link}-${index}`} 
            className="flex flex-col p-4 bg-black/20 backdrop-blur border border-white/10 hover:border-cyber-green/30 rounded-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 border border-white/10 text-xs font-bold mr-2">
                  {source.num || index + 1}
                </div>
                <h3 className="font-medium text-white truncate">
                  {source.title || "Unknown Source"}
                </h3>
              </div>
              {source.verified !== undefined && (
                <div className={`flex items-center text-xs ${source.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {source.verified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Unverified</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm text-white/60 mt-1 line-clamp-2">
              {source.preview || "No preview available"}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded">
                {source.source || "Unknown"}
              </span>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-black/30 hover:bg-black/50"
                onClick={() => window.open(source.link, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SourcesView;