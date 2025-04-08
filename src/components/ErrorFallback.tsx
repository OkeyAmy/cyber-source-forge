
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  message?: string;
}

const ErrorFallback = ({ error, resetErrorBoundary, message }: ErrorFallbackProps) => {
  return (
    <div className="p-6 rounded-lg border border-red-300 bg-red-50 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 flex flex-col items-center text-center">
      <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold mb-2">
        {message || "Something went wrong"}
      </h2>
      <p className="text-sm mb-4 max-w-md">
        {error.message}
      </p>
      <Button 
        variant="outline" 
        className="bg-white dark:bg-red-900/40 text-red-600 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/60"
        onClick={resetErrorBoundary}
      >
        Try Again
      </Button>
    </div>
  );
};

export default ErrorFallback;
