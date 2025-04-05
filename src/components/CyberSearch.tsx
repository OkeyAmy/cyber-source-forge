
import React, { useState } from 'react';
import { Search, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CyberSearch = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsProcessing(true);
    
    // Store the query in session storage to retrieve it after authentication
    sessionStorage.setItem('pendingQuery', query);
    
    toast({
      title: "Neural System Online",
      description: "Initializing search protocols... Authentication required.",
    });
    
    // Simulate a brief delay before redirecting to the auth page
    setTimeout(() => {
      navigate('/auth');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 -mt-6">
      <div className="cyber-card p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyber-magenta via-cyber-cyan to-cyber-green opacity-70"></div>
        
        <form onSubmit={handleSearch} className="relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-cyber-green" />
              </div>
              <input
                type="text"
                placeholder="Enter your research query..."
                className="cyber-input pl-10 w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Sparkles className="h-4 w-4 text-cyber-magenta animate-pulse" />
              </div>
            </div>
            
            <button 
              type="submit"
              className="cyber-button flex items-center justify-center"
              disabled={isProcessing || !query.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Neural Search</span>
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="cyber-badge">
            <Zap className="inline h-3 w-3 mr-1 text-cyber-green" />
            Blockchain Verified
          </span>
          <span className="cyber-badge">
            <Zap className="inline h-3 w-3 mr-1 text-cyber-cyan" />
            Neural Source Analysis
          </span>
          <span className="cyber-badge">
            <Zap className="inline h-3 w-3 mr-1 text-cyber-magenta" />
            Decentralized Credibility
          </span>
        </div>
      </div>
    </section>
  );
};

export default CyberSearch;
