
import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Database, Power } from 'lucide-react';

const CyberHeader: React.FC = () => {
  return (
    <header className="relative z-10 w-full py-4 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-cyber-dark rounded-md border-2 border-cyber-green flex items-center justify-center animate-pulse-neon">
            <Database className="text-cyber-green w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold cyber-text-gradient">
              SOURCE<span className="text-cyber-green">FINDER</span>
            </h1>
            <p className="text-xs text-cyber-cyan">v0.1.0 BETA</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-white hover:text-cyber-green transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-green transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#about" className="text-white hover:text-cyber-green transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-green transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#docs" className="text-white hover:text-cyber-green transition-colors relative group">
            Docs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-green transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="cyber-button hidden sm:flex"
            onClick={() => alert("Web3 wallet integration coming soon!")}
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Connect Wallet</span>
          </Button>
          <Button 
            variant="ghost" 
            className="p-2 text-white hover:text-cyber-green transition-colors"
          >
            <Power className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CyberHeader;
