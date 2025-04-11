import React, { useState, useEffect } from 'react';
import { SourceType } from '@/types/chatTypes';
import SourceCard from './SourceCard';
import { api } from '@/services/api';
import { Shield, Sparkles, Filter, ChevronDown, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface AllSourcesViewProps {
  sessionId?: string;
  className?: string;
}

const AllSourcesView: React.FC<AllSourcesViewProps> = ({ 
  sessionId,
  className
}) => {
  const [sources, setSources] = useState<SourceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  
  // Get unique source types
  const sourceTypes = Array.from(new Set(sources.map(src => src.source)));
  
  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSources(sessionId);
      setSources(data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSources();
  }, [sessionId]);
  
  // Filter sources based on active filter
  const filteredSources = activeFilter 
    ? sources.filter(src => src.source === activeFilter)
    : sources;
    
  // Count verified and unverified sources
  const verifiedCount = sources.filter(s => s.verified).length;
  const unverifiedCount = sources.length - verifiedCount;
  
  // Handle source click
  const handleSourceClick = (source: SourceType) => {
    window.open(source.link, '_blank');
  };
  
  return (
    <div className={`bg-cyber-dark/80 rounded-lg border border-cyber-green/20 p-4 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-cyber-green" />
          All Sources ({sources.length})
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-white/70 border-white/10 hover:border-cyber-green/40 hover:text-cyber-green flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3 w-3" />
            <span>Filter</span>
            <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-white/70 border-white/10 hover:border-cyber-green/40 hover:text-cyber-green"
            onClick={fetchSources}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            className={`cursor-pointer ${!activeFilter ? 'bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green' : 'bg-white/10 hover:bg-white/20'}`}
            onClick={() => setActiveFilter(null)}
          >
            All
          </Badge>
          {sourceTypes.map(type => (
            <Badge 
              key={type}
              className={`cursor-pointer ${activeFilter === type ? 'bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green' : 'bg-white/10 hover:bg-white/20'}`}
              onClick={() => setActiveFilter(type)}
            >
              {type}
            </Badge>
          ))}
          
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center">
              <Shield className="h-3 w-3 text-cyber-green mr-1" />
              <span className="text-xs text-white/70">Verified: <span className="text-cyber-green">{verifiedCount}</span></span>
            </div>
            <div className="flex items-center">
              <Shield className="h-3 w-3 text-cyber-magenta mr-1" />
              <span className="text-xs text-white/70">Unverified: <span className="text-cyber-magenta">{unverifiedCount}</span></span>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-cyber-green">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading sources...</span>
        </div>
      ) : sources.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-white/40">
          <Sparkles className="h-10 w-10 mb-3 opacity-30 text-cyber-green" />
          <p>No sources found for this session</p>
          <p className="text-sm mt-1">Start a conversation to gather sources</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map((source, idx) => (
              <div 
                key={`${source.link}-${idx}`}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,255,170,0.2)] ${
                  source.verified ? 'border-cyber-green/30 bg-cyber-green/5' : 'border-cyber-magenta/30 bg-cyber-magenta/5'
                }`}
                onClick={() => handleSourceClick(source)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs py-0.5 px-2 rounded-full ${
                    source.verified ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-magenta/20 text-cyber-magenta'
                  }`}>
                    {source.source}
                  </span>
                  <div className="flex items-center">
                    {source.verified ? (
                      <>
                        <span className="text-xs mr-1 text-cyber-green">Verified</span>
                        <Shield className="h-3 w-3 text-cyber-green" />
                      </>
                    ) : (
                      <>
                        <span className="text-xs mr-1 text-cyber-magenta">Unverified</span>
                        <Shield className="h-3 w-3 text-cyber-magenta" />
                      </>
                    )}
                  </div>
                </div>
                <h5 className="text-sm font-medium text-white/90 mb-2 line-clamp-2">{source.title}</h5>
                <p className="text-xs text-white/70 mb-2 line-clamp-3">{source.preview}</p>
                <a 
                  href={source.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-cyber-cyan hover:underline flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate">{source.link}</span>
                  <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AllSourcesView; 