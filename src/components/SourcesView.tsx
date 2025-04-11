import React from 'react';
import { Sparkles, Shield } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';
import { cn } from '@/lib/utils';
import SourceCard from './SourceCard';

interface SourcesViewProps {
  sources: SourceType[];
  currentSource: 'Reddit' | 'Academic' | 'All Sources';
  onSourceClick: (source: SourceType) => void;
  className?: string;
}

function SourcesView({ sources, currentSource, onSourceClick, className }: SourcesViewProps) {
  // Filter sources based on currentSource
  const filteredSources = sources.filter(source => 
    currentSource === 'All Sources' || source.source === currentSource
  );
  
  // Count verified sources
  const verifiedCount = filteredSources.filter(source => source.verified).length;
  
  // Group sources by their 'verified' status
  const verifiedSources = filteredSources.filter(source => source.verified);
  const unverifiedSources = filteredSources.filter(source => !source.verified);
  
  if (filteredSources.length === 0) {
    return (
      <div className={cn("h-full flex flex-col items-center justify-center text-white/40", className)}>
        <Sparkles className="h-12 w-12 mb-4 opacity-30 text-cyber-green" />
        <p className="text-lg">No sources gathered yet</p>
        <p className="text-sm mt-2">Start a conversation to collect verified sources</p>
      </div>
    );
  }
  
  return (
    <div className={cn("p-6", className)}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1 text-white flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-cyber-green" />
          {currentSource} ({filteredSources.length})
        </h2>
        <p className="text-sm text-white/60">
          {verifiedCount} verified sources, {filteredSources.length - verifiedCount} unverified sources
        </p>
      </div>
      
      {/* Verified sources section */}
      {verifiedSources.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <Shield className="h-4 w-4 mr-2 text-cyber-green" />
            <h3 className="text-base font-medium text-white">Verified Sources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedSources.map((source, idx) => (
              <SourceCard
                key={idx}
                source={source}
                size="large"
                showPreview={true}
                onClick={() => onSourceClick(source)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Unverified sources section */}
      {unverifiedSources.length > 0 && (
        <div>
          <div className="flex items-center mb-3">
            <Sparkles className="h-4 w-4 mr-2 text-cyber-cyan" />
            <h3 className="text-base font-medium text-white">Other Sources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unverifiedSources.map((source, idx) => (
              <SourceCard
                key={idx}
                source={source}
                size="large"
                showPreview={true}
                onClick={() => onSourceClick(source)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SourcesView; 