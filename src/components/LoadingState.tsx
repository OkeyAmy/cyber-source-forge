
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  type: 'sources' | 'chat' | 'skeleton';
  count?: number;
};

const LoadingState: React.FC<LoadingStateProps> = ({ type, count = 3 }) => {
  if (type === 'sources') {
    return (
      <div className="space-y-4 animate-pulse">
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className="cyber-card p-3">
            <div className="flex items-start">
              <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full mr-2">
                <Skeleton className="w-4 h-4 rounded-full bg-cyber-green/20" />
              </div>
              <div className="w-full">
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-3 w-4/5 mb-2 bg-white/10" />
                <div className="flex mt-2">
                  <Skeleton className="h-3 w-24 rounded-full bg-cyber-green/20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="space-y-6 animate-pulse">
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} max-w-3xl ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
            <div className={`rounded-lg p-4 ${
              i % 2 === 0 
                ? 'bg-cyber-dark/60 border border-cyber-green/20' 
                : 'bg-cyber-magenta/10 border border-cyber-magenta/20'
            }`}>
              <Skeleton className={`h-4 w-[${Math.random() * 150 + 100}px] mb-2 ${i % 2 === 0 ? 'bg-white/10' : 'bg-white/20'}`} />
              <Skeleton className={`h-4 w-[${Math.random() * 200 + 150}px] mb-2 ${i % 2 === 0 ? 'bg-white/10' : 'bg-white/20'}`} />
              <Skeleton className={`h-4 w-[${Math.random() * 100 + 50}px] ${i % 2 === 0 ? 'bg-white/10' : 'bg-white/20'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default skeleton loading
  return (
    <div className="space-y-2 animate-pulse">
      {Array(count).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full bg-white/10" />
      ))}
    </div>
  );
};

export default LoadingState;
