
import React from 'react';
import { Database, Github, Twitter, Heart } from 'lucide-react';

const CyberFooter: React.FC = () => {
  return (
    <footer className="w-full py-8 px-4 border-t border-cyber-green/20 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-8 h-8 bg-cyber-dark rounded-md border-2 border-cyber-green flex items-center justify-center mr-2">
              <Database className="text-cyber-green w-4 h-4" />
            </div>
            <span className="font-bold cyber-text-gradient">SOURCE<span className="text-cyber-green">FINDER</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-white hover:text-cyber-green transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-cyber-green transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-6 pt-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm mb-4 md:mb-0">
              © 2025 SourceFinder. All rights reserved.
            </p>
            
            <div className="flex items-center text-sm text-white/50">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-cyber-magenta mx-1 animate-pulse" />
              <span>in the Cyberweb</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CyberFooter;
