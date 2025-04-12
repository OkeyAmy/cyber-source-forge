import React from 'react';

interface CyberSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CyberSpinner: React.FC<CyberSpinnerProps> = ({ 
  text = 'Loading',
  size = 'md', 
  className = '' 
}) => {
  const getSize = () => {
    switch(size) {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-16 h-16';
      case 'md':
      default: return 'w-12 h-12';
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`cyber-spinner ${getSize()}`}>
        <div className="cyber-spinner-outer"></div>
        <div className="cyber-spinner-middle"></div>
        <div className="cyber-spinner-inner"></div>
      </div>
      
      {text && (
        <div className="cyber-loading-text mt-3">
          {text}
        </div>
      )}
    </div>
  );
}; 