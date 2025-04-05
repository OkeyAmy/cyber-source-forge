
import React, { useState } from 'react';
import { Search, Mic, Bot, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CyberSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search process
    setTimeout(() => {
      setIsSearching(false);
    }, 3000);
  };
  
  return (
    <div className="relative w-full max-w-4xl mx-auto my-12 px-4">
      <div className="absolute inset-0 bg-cyber-radial opacity-30 blur-lg"></div>
      
      <div className="relative bg-cyber-dark border-2 border-cyber-green rounded-lg glassmorphism p-8 animate-float">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg -z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-magenta rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyber-cyan rounded-full filter blur-3xl opacity-10"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-6 cyber-text-gradient text-center">
          Neural Source Intelligence
        </h2>
        
        <div className="max-w-xl mx-auto">
          <p className="text-cyber-light opacity-70 text-center mb-8">
            Research with the power of verified sources, blockchain transparency, and AI-powered analysis.
          </p>
          
          <form onSubmit={handleSearch} className="relative">
            <div className={`relative transition-all duration-500 ${isSearching ? 'animate-pulse-neon' : ''}`}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your research query..."
                className="cyber-input w-full pl-12 pr-12 py-4 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyber-green w-5 h-5" />
              
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-white hover:text-cyber-green"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-cyber-green"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                className="cyber-button"
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <>
                    <Bot className="mr-2 h-4 w-4 animate-spin" />
                    <span>Scanning Sources...</span>
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <div className="cyber-badge">Blockchain Verified</div>
            <div className="cyber-badge">Neural Analysis</div>
            <div className="cyber-badge">Decentralized</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberSearch;
