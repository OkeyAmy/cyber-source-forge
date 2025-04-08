
import React from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  message?: string;
}

const ErrorFallback = ({ error, resetErrorBoundary, message }: ErrorFallbackProps) => {
  return (
    <div className="p-6 rounded-lg border border-red-300 bg-red-50/10 text-red-200 dark:bg-red-900/20 dark:border-red-800 flex flex-col items-center text-center max-w-md mx-auto my-8">
      <div className="relative w-16 h-16 mb-5">
        <AlertTriangle className="h-16 w-16 text-red-500 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Database className="h-5 w-5 text-red-300" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-red-300 to-red-500 text-transparent bg-clip-text">
        {message || "API Connection Error"}
      </h2>
      
      <div className="border-l-2 border-red-400/30 pl-3 mb-5">
        <p className="text-sm mb-3 text-left text-red-300/90">
          {error.message}
        </p>
        <p className="text-xs text-left text-red-300/60">
          The system couldn't connect to the Source Finder API. This might be due to network issues or server unavailability.
        </p>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 dark:border-red-700 dark:text-red-300"
          onClick={resetErrorBoundary}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ErrorFallback;
