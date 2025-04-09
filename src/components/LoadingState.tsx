
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  phase?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...",
  phase = 0
}) => {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="animate-spin">
          <Loader2 className="h-5 w-5 text-cyber-green" />
        </div>
        <p className="text-sm text-white/90">{message}</p>
      </div>
      <div className="mt-3 space-y-2">
        {phase >= 1 && (
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyber-green/40 rounded-full animate-pulse"
              style={{
                width: '60%',
                boxShadow: '0 0 10px rgba(0, 255, 170, 0.5)'
              }}
            ></div>
          </div>
        )}
        {phase >= 2 && (
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyber-green/60 rounded-full animate-pulse"
              style={{
                width: '30%',
                boxShadow: '0 0 10px rgba(0, 255, 170, 0.5)'
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
