import React from 'react';
import { Shield, Database, Search, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingMessageProps {
  message: string;
  phase: number;
  className?: string;
}

function LoadingMessage({ message, phase, className }: LoadingMessageProps) {
  // Define phase-specific details
  const phases = [
    { name: 'Processing', icon: <Database className="h-4 w-4" /> },
    { name: 'Searching', icon: <Search className="h-4 w-4" /> },
    { name: 'Analyzing', icon: <LineChart className="h-4 w-4" /> },
  ];

  return (
    <div 
      className={cn("flex w-full my-4 px-4 justify-start animate-fadeIn", className)}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mr-2">
        <Shield className="h-4 w-4 text-cyber-green animate-pulse" />
      </div>
      <div className="bg-gray-700/90 text-white rounded-tl-xl rounded-tr-xl rounded-br-xl p-3 max-w-[80%] shadow-sm">
        <div className="text-xs font-medium mb-2 flex justify-between items-center">
          <span>Source Finder AI</span>
          <span className="text-cyber-green animate-pulse flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse"></span>
            Working...
          </span>
        </div>

        <div className="flex flex-col items-start w-full">
          <div className="flex items-center mb-2">
            <div className="mr-2 text-base text-white/90 font-medium">{message}</div>
            <div className="flex space-x-1">
              <span 
                className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" 
                style={{ animationDelay: '0ms' }}
                aria-hidden="true"
              ></span>
              <span 
                className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" 
                style={{ animationDelay: '300ms' }}
                aria-hidden="true"
              ></span>
              <span 
                className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" 
                style={{ animationDelay: '600ms' }}
                aria-hidden="true"
              ></span>
            </div>
          </div>
          
          {/* Progress bar with improved styling */}
          <div 
            className="w-full h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden"
            role="progressbar" 
            aria-valuenow={Math.min((phase + 1) * 33, 100)} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            <div 
              className="h-full bg-gradient-to-r from-cyber-green/80 to-cyber-green transition-all duration-700 ease-in-out rounded-full"
              style={{ width: `${Math.min((phase + 1) * 33, 100)}%` }}
            ></div>
          </div>
          
          {/* Phase indicators with icons */}
          <div className="w-full flex justify-between text-xs">
            {phases.map((p, idx) => (
              <div key={idx} className="flex items-center">
                <div 
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center mr-1.5 transition-colors",
                    phase >= idx ? 'bg-cyber-green/20' : 'bg-white/10'
                  )}
                >
                  <span className={cn(
                    "text-xs transition-colors",
                    phase >= idx ? 'text-cyber-green' : 'text-white/40'
                  )}>
                    {idx + 1}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-xs transition-colors",
                    phase >= idx ? 'text-cyber-green' : 'text-white/40'
                  )}>
                    {p.name}
                  </span>
                  {phase === idx && (
                    <span className="h-0.5 w-full bg-cyber-green mt-0.5 animate-pulse rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingMessage; 