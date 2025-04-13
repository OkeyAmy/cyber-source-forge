import React from 'react';
import { MoreHorizontal, Search, Database, Cpu } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  phase?: number;
}

export function LoadingState({ message, phase = 0 }: LoadingStateProps) {
  const getIcon = () => {
    switch(phase) {
      case 1: return <Search className="h-4 w-4 text-cyber-green animate-pulse" />;
      case 2: return <Database className="h-4 w-4 text-cyber-green animate-pulse" />;
      case 3: return <Cpu className="h-4 w-4 text-cyber-green animate-pulse" />;
      default: return <MoreHorizontal className="h-4 w-4 text-cyber-green animate-pulse" />;
    }
  };
  
  const getLabel = () => {
    switch(phase) {
      case 1: return "Searching sources...";
      case 2: return "Retrieving information...";
      case 3: return "Generating response...";
      default: return message || "Processing...";
    }
  };
  
  // Create a typing animation for the dots
  const [dots, setDots] = React.useState('');
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length < 3) return prev + '.';
        return '';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center mb-3">
      <div className="h-8 w-8 rounded-full bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center mr-3">
        {getIcon()}
      </div>
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-white/10 py-3 px-4 rounded-xl shadow-md max-w-md">
        <div className="flex items-center">
          <div className="loading-dots">
            <span className="animate-pulse">{getLabel()}</span>
            <span className="text-white/60 inline-block w-7">{dots}</span>
          </div>
        </div>
        
        {/* Progress bar that fills up based on the phase */}
        <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-full animate-pulse"
            style={{ 
              width: `${(phase / 3) * 100}%`,
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </div>
      </div>
    </div>
  );
}
