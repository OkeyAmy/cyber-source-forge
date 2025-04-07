
import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, Shield, Calendar, Database, AlertTriangle } from 'lucide-react';

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
      <h3 className="text-2xl font-bold mb-8 text-center cyber-text-gradient">
        Verified Source Results
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <div 
            key={result.id}
            className="cyber-card h-full"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'fade-in 0.5s ease-out forwards',
              opacity: 0,
            }}
          >
            <div className="relative p-6 h-full flex flex-col">
              <div className="absolute top-0 right-0 h-16 w-16">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-b-0 border-l-0 border-t-cyber-magenta/30 border-r-cyber-cyan/30"></div>
              </div>
              
              <h4 className="text-lg font-bold mb-2 text-white">{result.title}</h4>
              
              <div className="text-sm text-cyber-cyan mb-2 flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {result.url}
                </a>
              </div>
              
              <p className="text-white text-sm opacity-80 mb-4 line-clamp-3 flex-grow">
                {result.summary}
              </p>
              
              <div className="flex items-center justify-between text-xs border-t border-cyber-green/20 pt-3 mt-auto">
                <div className={`flex items-center ${result.verified ? 'text-cyber-green' : 'text-cyber-magenta'}`}>
                  {result.verified ? (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      <span>Verification: {result.verification}%</span>
                      <Check className="w-3 h-3 ml-1" />
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span>Unverified Source</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(result.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Database className="w-3 h-3 text-cyber-magenta" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CyberResults;
