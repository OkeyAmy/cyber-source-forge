import React from 'react';
import { Shield, ShieldAlert } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';

interface SourceListProps {
  sources: SourceType[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="source-list relative">
      {/* Horizontal scrollable container */}
      <div 
        className="flex overflow-x-auto pb-2 gap-3 scrollbar-thin scrollbar-thumb-cyber-green/30 scrollbar-track-transparent" 
        style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
      >
        {sources.map((source, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[280px] bg-black/30 p-3 rounded-md border border-white/10 hover:border-cyber-green/30 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-white/60 font-mono">{`Source ${index + 1}`}</div>
              {source.verified ? (
                <div className="flex items-center text-[#00ffaa] text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>Verified</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-400 text-xs">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  <span>Unverified</span>
                </div>
              )}
            </div>
            
            {/* Title with ellipsis for overflow */}
            <div className="font-medium text-sm mb-2 text-white truncate">{source.title}</div>
            
            {/* Description with line clamping */}
            <div className="text-xs text-white/70 line-clamp-3 mb-2">{source.description}</div>
            
            {/* Meta information */}
            <div className="flex justify-between items-center text-[10px] text-white/50">
              <div>{new Date(source.date).toLocaleDateString()}</div>
              <div className="truncate max-w-[150px]">{source.url}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gradient indicators for horizontal scrolling */}
      <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-[#0a0e17] to-transparent pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-[#0a0e17] to-transparent pointer-events-none" />
    </div>
  );
};

// All Sources component for modal display
export const AllSources: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="py-8 text-center text-white/50">
        No sources available
      </div>
    );
  }

  return (
    <div className="all-sources-grid">
      {sources.map((source, index) => (
        <SourceCard key={`${source.link}-${index}`} source={source} />
      ))}
    </div>
  );
};

export default SourceList; 