import React, { useEffect, useState } from 'react';
import { X, Shield, Database, ExternalLink, Filter, SortAsc, Search } from 'lucide-react';
import { SourceType } from '@/types/chatTypes';
import { AllSources } from './SourceList';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ViewAllSourcesProps {
  sources: SourceType[];
  isOpen: boolean;
  onClose: () => void;
}

const ViewAllSources: React.FC<ViewAllSourcesProps> = ({ 
  sources, 
  isOpen, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [filteredSources, setFilteredSources] = useState<SourceType[]>(sources);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mounted, setMounted] = useState(false);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small delay for mount animation
      setTimeout(() => setMounted(true), 50);
    } else {
      document.body.style.overflow = '';
      setMounted(false);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Filter and sort sources
  useEffect(() => {
    if (!sources) return;
    
    let result = [...sources];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(source => 
        source.title?.toLowerCase().includes(term) || 
        source.preview?.toLowerCase().includes(term) ||
        source.source?.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (currentFilter !== 'all') {
      result = result.filter(source => 
        source.source?.toLowerCase() === currentFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    
    setFilteredSources(result);
  }, [sources, searchTerm, currentFilter, sortOrder]);
  
  // Get unique source types
  const sourceTypes = ['all', ...new Set(sources.map(s => s.source.toLowerCase()))];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] bg-[#0a0e17] border border-[rgba(0,255,170,0.2)] rounded-md overflow-hidden flex flex-col transition-all duration-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[rgba(0,255,170,0.2)]">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-[rgb(0,255,170)] mr-2" />
            <h2 className="text-white text-lg font-medium">Source Database</h2>
            <div className="ml-3 px-2 py-1 text-xs bg-[rgba(0,255,170,0.1)] text-[rgb(0,255,170)] rounded">
              {filteredSources.length} {filteredSources.length === 1 ? 'source' : 'sources'}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="px-4 py-3 border-b border-[rgba(0,255,170,0.1)] bg-black/20">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
              <Input 
                type="text"
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/30 border-[rgba(0,255,170,0.2)] pl-8 text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-[rgb(0,255,170)]" />
              <div className="flex flex-wrap gap-1">
                {sourceTypes.map(type => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className={`text-xs py-1 px-2 h-auto ${currentFilter === type ? 'bg-[rgba(0,255,170,0.1)] text-[rgb(0,255,170)] border-[rgba(0,255,170,0.3)]' : 'bg-transparent border-white/10 text-white/70'}`}
                    onClick={() => setCurrentFilter(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-transparent border-white/10 text-white/70 h-8"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <SortAsc className="h-4 w-4" />
              <span>Sort {sortOrder === 'asc' ? '↑' : '↓'}</span>
            </Button>
          </div>
        </div>
        
        {/* Content - Using flex-1 and overflow-y-auto for proper scrolling */}
        <div className="flex-1 overflow-hidden">
          {/* This wrapper ensures the content is scrollable */}
          <div className="h-full overflow-y-auto px-4 pb-6 pt-2">
            {filteredSources.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-white/40">
                <Search className="h-10 w-10 mb-2 opacity-50" />
                <p>No matching sources found</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    className="text-cyber-green mt-2"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <AllSources sources={filteredSources} />
            )}
          </div>
        </div>
        
        {/* Footer with blockchain visual data */}
        <div className="px-4 py-3 border-t border-[rgba(0,255,170,0.2)] flex justify-between items-center bg-black/30">
          <div className="text-xs text-white/60 flex items-center">
            <Shield className="h-3.5 w-3.5 mr-1.5 text-[rgb(0,255,170)]" />
            Source verification powered by blockchain
          </div>
          
          <div className="flex space-x-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={i % 3 === 0 ? "data-block-verified" : "data-block"}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  opacity: Math.random() * 0.5 + 0.5
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllSources; 