
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Database, Power, Menu, X } from 'lucide-react';

const CyberHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-8 transition-all duration-300 ${isScrolled ? 'bg-cyber-dark/90 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,255,65,0.1)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-cyber-dark rounded-md border-2 border-cyber-green flex items-center justify-center animate-pulse-neon group-hover:scale-110 transition-transform duration-300">
            <Database className="text-cyber-green w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold cyber-text-gradient">
              SOURCE<span className="text-cyber-green">FINDER</span>
            </h1>
            <p className="text-xs text-cyber-cyan animate-pulse">v0.1.0 BETA</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-white hover:text-cyber-green transition-colors relative group py-2">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-green transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#about" className="text-white hover:text-cyber-green transition-colors relative group py-2">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-green transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#docs" className="text-white hover:text-cyber-green transition-colors relative group py-2">
            Docs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-green transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="cyber-button hidden sm:flex relative overflow-hidden group"
            onClick={() => alert("Web3 wallet integration coming soon!")}
          >
            <span className="relative z-10 flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Connect Wallet</span>
            </span>
            <span className="absolute inset-0 w-0 bg-cyber-green/20 transition-all duration-500 group-hover:w-full"></span>
          </Button>
          <Button 
            variant="ghost" 
            className="p-2 text-white hover:text-cyber-green transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 md:hidden" />}
            <Power className="h-5 w-5 hidden md:block" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-cyber-dark/95 backdrop-blur-xl transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-60 border-b border-cyber-green/30' : 'max-h-0'}`}>
        <nav className="flex flex-col p-4 gap-4">
          <a href="#features" className="text-white hover:text-cyber-green transition-colors py-2 pl-2 border-l-2 border-cyber-green/40 hover:border-cyber-green">
            Features
          </a>
          <a href="#about" className="text-white hover:text-cyber-green transition-colors py-2 pl-2 border-l-2 border-cyber-green/40 hover:border-cyber-green">
            About
          </a>
          <a href="#docs" className="text-white hover:text-cyber-green transition-colors py-2 pl-2 border-l-2 border-cyber-green/40 hover:border-cyber-green">
            Docs
          </a>
        </nav>
      </div>
    </header>
  );
};

export default CyberHeader;
