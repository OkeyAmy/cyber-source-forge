
import React from 'react';
import { Database, Github, Twitter, Heart, Mail, Shield, ArrowUp } from 'lucide-react';

const CyberFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="w-full py-16 px-4 border-t border-cyber-green/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent"></div>
      <div className="absolute inset-0 bg-cyber-radial opacity-10"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <button 
            onClick={scrollToTop}
            className="w-10 h-10 bg-cyber-dark rounded-full border border-cyber-green/40 flex items-center justify-center hover:scale-110 transition-transform duration-300 mb-4 hover:border-cyber-green hover:shadow-[0_0_15px_rgba(0,255,157,0.3)]"
          >
            <ArrowUp className="text-cyber-green w-4 h-4" />
          </button>
          <h2 className="text-2xl font-bold cyber-text-gradient">
            SOURCE<span className="text-cyber-green">FINDER</span>
          </h2>
          <p className="text-white/40 text-sm mt-2">The future of research is here</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <h3 className="text-cyber-green text-lg font-semibold mb-4">About</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              SourceFinder is an advanced AI-powered research tool combining neural networks, 
              blockchain verification, and decentralized storage to provide the most credible 
              and trustworthy sources for your research queries.
            </p>
          </div>
          
          <div>
            <h3 className="text-cyber-green text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-white/60 text-sm hover:text-cyber-green transition-colors flex items-center">
                  <span className="w-1 h-1 bg-cyber-green rounded-full mr-2"></span>
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-white/60 text-sm hover:text-cyber-green transition-colors flex items-center">
                  <span className="w-1 h-1 bg-cyber-green rounded-full mr-2"></span>
                  About
                </a>
              </li>
              <li>
                <a href="#docs" className="text-white/60 text-sm hover:text-cyber-green transition-colors flex items-center">
                  <span className="w-1 h-1 bg-cyber-green rounded-full mr-2"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a href="/hub" className="text-white/60 text-sm hover:text-cyber-green transition-colors flex items-center">
                  <span className="w-1 h-1 bg-cyber-green rounded-full mr-2"></span>
                  Research Hub
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cyber-green text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-8 h-8 bg-cyber-dark/80 rounded-full flex items-center justify-center border border-white/10 hover:border-cyber-green/50 hover:scale-110 transition-all">
                <Github className="w-4 h-4 text-white hover:text-cyber-green transition-colors" />
              </a>
              <a href="#" className="w-8 h-8 bg-cyber-dark/80 rounded-full flex items-center justify-center border border-white/10 hover:border-cyber-green/50 hover:scale-110 transition-all">
                <Twitter className="w-4 h-4 text-white hover:text-cyber-green transition-colors" />
              </a>
              <a href="#" className="w-8 h-8 bg-cyber-dark/80 rounded-full flex items-center justify-center border border-white/10 hover:border-cyber-green/50 hover:scale-110 transition-all">
                <Mail className="w-4 h-4 text-white hover:text-cyber-green transition-colors" />
              </a>
              <a href="#" className="w-8 h-8 bg-cyber-dark/80 rounded-full flex items-center justify-center border border-white/10 hover:border-cyber-green/50 hover:scale-110 transition-all">
                <Shield className="w-4 h-4 text-white hover:text-cyber-green transition-colors" />
              </a>
            </div>
            <p className="text-white/60 text-sm">
              Have questions? Contact us at<br />
              <a href="mailto:info@source-finder.ai" className="text-cyber-green hover:underline">info@source-finder.ai</a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6">
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
