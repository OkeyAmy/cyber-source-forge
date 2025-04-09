
import React, { useState, useEffect } from 'react';
import { Search, Mic, Bot, X, Sparkles, Code, Brain, Shield, Database } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const searchSuggestions = [
  "Latest AI research advances",
  "Blockchain technology adoption",
  "Quantum computing breakthroughs",
  "Climate change scientific consensus",
  "Web3 development trends"
];

const CyberSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showParticles, setShowParticles] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Store the query in session storage so we can use it after auth
    sessionStorage.setItem('pendingQuery', query);
    
    // Simulate brief loading before redirect
    setTimeout(() => {
      setIsSearching(false);
      // Redirect to auth page
      navigate('/auth');
    }, 1200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Focus the input after selecting a suggestion
    const inputElement = document.getElementById('search-input');
    if (inputElement) {
      inputElement.focus();
    }
  };
  
  return (
    <div className="relative w-full max-w-4xl mx-auto my-16 px-4">
      <div className="absolute inset-0 bg-cyber-radial opacity-30 blur-lg"></div>
      
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-cyber-green rounded-full opacity-70 animate-float"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative bg-cyber-dark border-2 border-cyber-green/50 rounded-lg glassmorphism p-8 md:p-10 animate-float shadow-[0_0_25px_rgba(0,255,157,0.25)]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg -z-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-magenta rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyber-cyan rounded-full filter blur-3xl opacity-10"></div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-cyber-dark/80 rounded-full border-2 border-cyber-green/40 animate-pulse-neon">
            <Brain className="w-8 h-8 text-cyber-green" />
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 cyber-text-gradient">
              AI Source Intelligence
            </h2>
            <p className="text-cyber-light opacity-70 max-w-2xl">
              Research with the power of verified sources, blockchain transparency, and AI-powered analysis.
            </p>
          </div>
        </div>
        
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className={`relative transition-all duration-500 ${isSearching ? 'animate-pulse-neon' : ''}`}>
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your research query..."
                className="cyber-input w-full pl-12 pr-12 py-4 text-lg rounded-full focus:shadow-[0_0_20px_rgba(0,255,157,0.6)] transition-shadow duration-300"
                onFocus={() => setActiveSuggestion(-1)}
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyber-green w-5 h-5" />
              
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-white hover:text-cyber-green transition-colors duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-cyber-green transition-colors duration-300"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Suggestions */}
            {!query && !isSearching && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {searchSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                      activeSuggestion === index 
                        ? 'bg-cyber-green/20 text-cyber-green' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onMouseLeave={() => setActiveSuggestion(-1)}
                  >
                    <Sparkles className="w-3 h-3 mr-2 flex-shrink-0" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                className="cyber-button hover:shadow-[0_0_15px_rgba(0,255,157,0.5)] transition-shadow duration-300 relative overflow-hidden group"
                disabled={isSearching || !query.trim()}
              >
                <span className="relative z-10 flex items-center">
                  {isSearching ? (
                    <>
                      <Bot className="mr-2 h-4 w-4 animate-spin" />
                      <span>Scanning Sources<span className="animate-pulse">...</span></span>
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      <span>Search</span>
                    </>
                  )}
                </span>
                <span className="absolute inset-0 w-0 bg-cyber-green/20 transition-all duration-500 group-hover:w-full"></span>
              </Button>
            </div>
          </form>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="cyber-badge hover:border-cyber-green hover:text-cyber-green transition-colors duration-300 flex items-center">
              <Shield className="w-3 h-3 mr-1" /> Blockchain Verified
            </div>
            <div className="cyber-badge hover:border-cyber-green hover:text-cyber-green transition-colors duration-300 flex items-center">
              <Brain className="w-3 h-3 mr-1" /> AI Analysis
            </div>
            <div className="cyber-badge hover:border-cyber-green hover:text-cyber-green transition-colors duration-300 flex items-center">
              <Database className="w-3 h-3 mr-1" /> Decentralized
            </div>
            <div className="cyber-badge hover:border-cyber-green hover:text-cyber-green transition-colors duration-300 flex items-center">
              <Code className="w-3 h-3 mr-1" /> Open Source
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberSearch;
