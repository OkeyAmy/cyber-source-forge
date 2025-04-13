import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Shield, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ContextPanelState, SourceReference, BlockchainVerification } from '@/types/chatTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContextPanelProps {
  state: ContextPanelState;
  sources: SourceReference[];
  verifications: BlockchainVerification[];
  onClose: () => void;
  onTabChange: (tab: 'sources' | 'verification' | 'search') => void;
  onSearch: (query: string) => void;
  className?: string;
}

export function ContextPanel({
  state,
  sources,
  verifications,
  onClose,
  onTabChange,
  onSearch,
  className = ''
}: ContextPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState(state.searchQuery || '');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle search input change with debounce
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchValue]);
  
  useEffect(() => {
    if (debouncedSearchValue) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch]);
  
  // Handle swipe gestures for mobile
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      touchEndX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      if (touchStartX - touchEndX > 100) {
        // Swipe left - collapse panel
        setIsCollapsed(true);
      } else if (touchEndX - touchStartX > 100) {
        // Swipe right - expand panel
        setIsCollapsed(false);
      }
    };
    
    panel.addEventListener('touchstart', handleTouchStart);
    panel.addEventListener('touchmove', handleTouchMove);
    panel.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      panel.removeEventListener('touchmove', handleTouchMove);
      panel.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  // Format blockchain timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Truncate hash for display
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div 
      ref={panelRef}
      className={`context-panel fixed top-[60px] right-0 h-[calc(100vh-60px)] bg-cyber-dark/95 border-l border-cyber-green/20 transition-all duration-300 ease-cubic-bezier shadow-xl ${
        isCollapsed ? 'w-10' : 'w-full md:w-[30%]'
      } ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Context panel"
    >
      {/* Collapse/Expand Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 left-0 transform -translate-x-full bg-cyber-dark text-cyber-green p-2 rounded-l-md border-t border-l border-b border-cyber-green/20 hover:bg-cyber-green/10 transition-colors"
        aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
      
      {/* Panel Content - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="h-full flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-cyber-green text-lg font-semibold">Context</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
              aria-label="Close panel"
            >
              <X size={18} />
            </Button>
          </div>
          
          {/* Tabs */}
          <Tabs 
            defaultValue={state.activeTab} 
            onValueChange={(value) => onTabChange(value as any)}
            className="w-full h-[calc(100%-3rem)]"
          >
            <TabsList className="bg-cyber-dark/50 border border-cyber-green/20 grid w-full grid-cols-3 mb-4">
              <TabsTrigger 
                value="sources" 
                className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
              >
                <FileText size={16} className="mr-2" />
                Sources
              </TabsTrigger>
              <TabsTrigger 
                value="verification"
                className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
              >
                <Shield size={16} className="mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger 
                value="search"
                className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
              >
                <Search size={16} className="mr-2" />
                Search
              </TabsTrigger>
            </TabsList>
            
            {/* Sources Tab */}
            <TabsContent value="sources" className="h-full overflow-y-auto px-1 py-2">
              {sources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sources.map((source) => (
                    <div 
                      key={source.num} 
                      id={`source-${source.num}`}
                      className="bg-cyber-dark/70 border border-cyber-green/20 rounded-xl p-3 hover:border-cyber-green/40 transition-colors"
                    >
                      <div className="flex items-center mb-2">
                        {source.logo && (
                          <img src={source.logo} alt="Source Logo" className="w-4 h-4 mr-2" />
                        )}
                        <span className="text-xs text-white/60 bg-cyber-green/20 px-2 py-0.5 rounded-full">
                          {source.source}
                        </span>
                        {source.verified && (
                          <span className="ml-2 text-xs text-white/60 bg-blue-500/20 px-2 py-0.5 rounded-full flex items-center">
                            <Shield size={10} className="mr-1 text-blue-400" />
                            Verified
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-medium text-white/90 line-clamp-2 mb-1">
                        {source.title}
                      </h3>
                      
                      <p className="text-xs text-white/70 line-clamp-3 mb-2">
                        {source.preview}
                      </p>
                      
                      {source.images && source.images.length > 0 && (
                        <div className="mb-2 overflow-x-auto no-scrollbar flex space-x-2">
                          {source.images.map((image, i) => (
                            <img 
                              key={i} 
                              src={image} 
                              alt={`Image from ${source.title}`} 
                              className="h-16 w-auto rounded-md object-cover border border-white/10"
                            />
                          ))}
                        </div>
                      )}
                      
                      <a 
                        href={source.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-cyber-green flex items-center hover:underline mt-1"
                      >
                        <ExternalLink size={12} className="mr-1" />
                        Visit Source
                      </a>
                      
                      {source.blockchainData && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-xs font-mono text-white/70 truncate">
                            Hash: {truncateHash(source.blockchainData.hash)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <FileText size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">No sources available</p>
                </div>
              )}
            </TabsContent>
            
            {/* Verification Tab */}
            <TabsContent value="verification" className="h-full overflow-y-auto px-1 py-2">
              {verifications.length > 0 ? (
                <div className="space-y-4">
                  {verifications.map((verification, index) => (
                    <div 
                      key={index}
                      className="bg-cyber-dark/70 border border-cyber-green/20 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/90">
                          Verification {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          verification.status === 'verified' 
                            ? 'bg-green-500/20 text-green-400' 
                            : verification.status === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 font-mono text-xs">
                        <p className="text-white/70">
                          <span className="text-white/50">Network:</span> {verification.network}
                        </p>
                        <p className="text-white/70">
                          <span className="text-white/50">Time:</span> {formatTimestamp(verification.timestamp)}
                        </p>
                        <p className="text-white/70 break-all">
                          <span className="text-white/50">Hash:</span> {verification.hash}
                        </p>
                        {verification.transactionId && (
                          <p className="text-white/70 break-all">
                            <span className="text-white/50">Tx ID:</span> {verification.transactionId}
                          </p>
                        )}
                        {verification.ipfsHash && (
                          <p className="text-white/70 break-all">
                            <span className="text-white/50">IPFS:</span> {verification.ipfsHash}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <Shield size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">No verifications available</p>
                </div>
              )}
            </TabsContent>
            
            {/* Search Tab */}
            <TabsContent value="search" className="h-full flex flex-col">
              <div className="mb-4">
                <div className="relative">
                  <Search 
                    size={16} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  />
                  <Input
                    ref={searchInputRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search sources..."
                    className="pl-10 bg-cyber-dark/50 border-cyber-green/20 focus:border-cyber-green/50 text-white placeholder:text-white/40"
                  />
                  {searchValue && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                      onClick={() => setSearchValue('')}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-1">
                {state.searchResults && state.searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {state.searchResults.map((result, index) => (
                      <div 
                        key={index}
                        className="bg-cyber-dark/70 border border-cyber-green/20 rounded-xl p-3"
                      >
                        <div className="flex items-center mb-1">
                          {result.logo && (
                            <img src={result.logo} alt="Source Logo" className="w-4 h-4 mr-2" />
                          )}
                          <span className="text-xs text-white/60">
                            {result.source}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-medium text-white/90 mb-1">
                          {result.title}
                        </h3>
                        
                        <p className="text-xs text-white/70 mb-2">
                          {result.preview}
                        </p>
                        
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-cyber-green flex items-center hover:underline"
                        >
                          <ExternalLink size={12} className="mr-1" />
                          Visit Source
                        </a>
                      </div>
                    ))}
                  </div>
                ) : searchValue ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <Search size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">No results found</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <Search size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">Enter a search term</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      <style jsx>{`
        /* Hide scrollbar but keep functionality */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        
        /* Custom transition timing */
        .ease-cubic-bezier {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
} 