
import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, Shield, Calendar, Database, AlertTriangle, Star } from 'lucide-react';

type ResultType = {
  id: number;
  title: string;
  url: string;
  summary: string;
  verification: number;
  date: string;
  verified: boolean;
};

// Sample data with randomly assigned verification status
const generateSampleResults = (): ResultType[] => {
  const baseResults = [
    {
      id: 1,
      title: "Quantum Computing Advances in Cryptography",
      url: "https://example.com/quantum-crypto",
      summary: "Recent developments in quantum computing show promising advances in cryptographic algorithms and security protocols.",
      verification: 92,
      date: "2025-03-15"
    },
    {
      id: 2,
      title: "Neural Networks for Source Validation",
      url: "https://example.com/neural-validation",
      summary: "Neural networks are being deployed to automatically validate and verify the credibility of online information sources.",
      verification: 87,
      date: "2025-02-28"
    },
    {
      id: 3,
      title: "Decentralized Identity Systems",
      url: "https://example.com/decentralized-identity",
      summary: "Blockchain-based decentralized identity systems are revolutionizing how we verify sources and information online.",
      verification: 95,
      date: "2025-01-10"
    },
    {
      id: 4,
      title: "AI-Powered Misinformation Detection",
      url: "https://example.com/ai-misinformation",
      summary: "New AI models can detect misinformation with increasing accuracy, helping combat the spread of false information.",
      verification: 78,
      date: "2025-03-22"
    },
    {
      id: 5,
      title: "Digital Footprint Analysis",
      url: "https://example.com/digital-footprint",
      summary: "Advanced techniques in digital footprint analysis aid in determining the reliability of digital content.",
      verification: 84,
      date: "2025-02-15"
    },
  ];

  // Apply 75% verification rate randomly
  return baseResults.map(result => ({
    ...result,
    verified: Math.random() < 0.75 // 75% chance of being verified
  }));
};

const CyberResults: React.FC = () => {
  const [results, setResults] = useState<ResultType[]>([]);
  
  useEffect(() => {
    // Simulate an API call by loading sample data with verification status
    setResults(generateSampleResults());
  }, []);
  
  return (
    <section className="w-full max-w-6xl mx-auto my-12 px-4">
      <h3 className="text-3xl font-bold mb-2 text-center cyber-text-gradient">
        Verified Source Results
      </h3>
      <p className="text-center text-white/70 mb-8 max-w-2xl mx-auto">
        AI-powered neural verification system has analyzed and verified these sources 
        with blockchain-backed authenticity protocols.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <div 
            key={result.id}
            className="cyber-card h-full overflow-hidden group hover:scale-[1.02] transition-all duration-300"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'fade-in 0.5s ease-out forwards',
              opacity: 0,
            }}
          >
            <div className="relative p-6 h-full flex flex-col">
              {/* Added verification badge */}
              <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center ${
                result.verified 
                  ? 'bg-cyber-green/20 text-cyber-green'
                  : 'bg-cyber-magenta/20 text-cyber-magenta'
              }`}>
                {result.verified ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span>Unverified</span>
                  </>
                )}
              </div>
              
              <div className="absolute top-0 right-0 h-16 w-16">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-b-0 border-l-0 border-t-cyber-magenta/30 border-r-cyber-cyan/30"></div>
              </div>
              
              <h4 className="text-lg font-bold mb-3 text-white group-hover:text-cyber-green transition-colors duration-300 pr-16">{result.title}</h4>
              
              <div className="text-sm text-cyber-cyan mb-3 flex items-center">
                <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline truncate hover:text-white transition-colors duration-300"
                >
                  {result.url}
                </a>
              </div>
              
              <p className="text-white/80 text-sm mb-4 line-clamp-3 flex-grow">
                {result.summary}
              </p>
              
              {/* Added verification meter */}
              {result.verified && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/70">Verification Score</span>
                    <span className="text-cyber-green font-semibold">{result.verification}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyber-green/70 to-cyber-green rounded-full" 
                      style={{ width: `${result.verification}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs border-t border-cyber-green/20 pt-3 mt-auto">
                <div className={`flex items-center ${result.verified ? 'text-cyber-green' : 'text-cyber-magenta'}`}>
                  {result.verified ? (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      <span>Blockchain Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span>Verification Pending</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(result.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Database className="w-3 h-3 text-cyber-magenta/80" />
              </div>
            </div>
            
            {/* Add hover overlay with a "View Source" button */}
            <div className="absolute inset-0 bg-cyber-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <button className="cyber-button-outline text-sm pointer-events-auto">
                View Complete Source
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Added a "load more" button */}
      <div className="mt-10 text-center">
        <button className="cyber-button px-6 py-3 inline-flex items-center group">
          <span>Load More Sources</span>
          <Database className="ml-2 w-4 h-4 group-hover:animate-pulse" />
        </button>
      </div>
    </section>
  );
};

export default CyberResults;
