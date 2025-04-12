import React from 'react';
import { Loader2, Search, Code, ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  phase?: number;
}

export function LoadingState({ message = 'Processing...', phase = 0 }: LoadingStateProps) {
  // Different phases have different indicators
  const renderPhaseIndicator = () => {
    switch(phase) {
      case 1: // Searching phase
        return (
          <div className="flex items-center space-x-2 text-[#00ffaa]">
            <div className="relative flex items-center justify-center">
              <Search className="h-4 w-4 absolute animate-pulse" />
              <div className="h-8 w-8 rounded-full border-2 border-[#00ffaa] opacity-40 animate-ping" />
            </div>
            <span className="text-sm font-mono tracking-wider">SEARCHING DATABASE...</span>
          </div>
        );
      case 2: // Analyzing phase
        return (
          <div className="flex items-center space-x-2 text-[#00ffaa]">
            <div className="flex space-x-1">
              <div className="h-2 w-2 rounded-full bg-[#00ffaa] animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-[#00ffaa] animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-[#00ffaa] animate-pulse" style={{ animationDelay: '300ms' }} />
              <div className="h-2 w-2 rounded-full bg-[#00ffaa] animate-pulse" style={{ animationDelay: '450ms' }} />
              <div className="h-2 w-2 rounded-full bg-[#00ffaa] animate-pulse" style={{ animationDelay: '600ms' }} />
            </div>
            <span className="text-sm font-mono tracking-wider">ANALYZING SOURCES...</span>
          </div>
        );
      case 3: // Generating response phase
        return (
          <div className="flex items-center space-x-2 text-[#00ffaa]">
            <div className="relative">
              <Code className="h-4 w-4 animate-spin" />
              <div className="absolute top-0 left-0 h-full w-full border border-[#00ffaa] animate-ping rounded-sm opacity-30" />
            </div>
            <span className="text-sm font-mono tracking-wider">GENERATING RESPONSE...</span>
          </div>
        );
      case 4: // Verifying phase
        return (
          <div className="flex items-center space-x-2 text-[#00ffaa]">
            <ShieldCheck className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-mono tracking-wider">VERIFYING SOURCES...</span>
            <div className="ml-2 flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className="h-1 w-1 rounded-full bg-[#00ffaa] animate-pulse" 
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 text-[#00ffaa]">
            <div className="relative">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="absolute top-[-4px] left-[-4px] h-6 w-6 border border-[#00ffaa]/30 animate-ping rounded-full" />
            </div>
            <span className="text-sm font-mono tracking-wider animate-pulse">{message}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex items-start">
      <div className="bg-black/20 border border-[#00ffaa]/10 rounded-md p-3 text-white/90 animate-fadeIn w-full">
        {renderPhaseIndicator()}
        <div className="flex mt-2 space-x-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="h-1 w-8 bg-[#00ffaa]/20 rounded-sm overflow-hidden"
            >
              <div 
                className="h-full bg-[#00ffaa] animate-pulse"
                style={{ 
                  width: `${Math.random() * 100}%`,
                  animationDelay: `${i * 120}ms`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
