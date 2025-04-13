import React from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingMessageProps {
  message: string;
  phase: number;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ message, phase }) => {
  return (
    <div className="bg-black/30 border border-cyber-green/30 text-white rounded-lg rounded-tl-none max-w-[90%] lg:max-w-[80%] overflow-hidden">
      <div className="border-b border-cyber-green/20 bg-cyber-green/5 px-4 py-2 flex items-center">
        <div className="w-6 h-6 rounded-full bg-cyber-green/20 flex items-center justify-center mr-2">
          <svg className="w-3.5 h-3.5 text-cyber-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 19 21 12 17 5 21 12 2"/>
          </svg>
        </div>
        <span className="text-xs text-cyber-green">SourceFinder AI</span>
      </div>
      
      <div className="p-4 flex items-center">
        <div className="animate-spin mr-3 text-cyber-green">
          <Loader className="h-4 w-4" />
        </div>
        
        <div>
          <p className="text-sm text-white/90">{message}</p>
          
          <div className="mt-2 h-1.5 bg-black/50 rounded-full w-64 overflow-hidden">
            {/* Progress bar based on phase */}
            <div 
              className="h-full bg-gradient-to-r from-cyber-green/60 to-cyber-green rounded-full transition-all duration-500 flex items-center justify-end"
              style={{ 
                width: phase === 0 ? '15%' : phase === 1 ? '55%' : '85%',
              }}
            >
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-cyber-green rounded-full shadow-[0_0_5px_rgba(0,255,170,0.7)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;