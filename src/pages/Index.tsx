
import React, { useEffect, useState } from 'react';
import CyberBackground from '@/components/CyberBackground';
import CyberHeader from '@/components/CyberHeader';
import CyberSearch from '@/components/CyberSearch';
import CyberResults from '@/components/CyberResults';
import CyberFeatures from '@/components/CyberFeatures';
import CyberFooter from '@/components/CyberFooter';
import CyberThreeScene from '@/components/CyberThreeScene';
import { Bot, ArrowDown, Shield, Database, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Show welcome toast
      toast({
        title: "AI Systems Online",
        description: "Welcome to SourceFinder. Blockchain verification active.",
        variant: "default"
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-dark">
        <div className="text-center">
          <div className="inline-block border-2 border-cyber-green rounded-full p-4 animate-pulse-neon mb-4">
            <Bot className="w-8 h-8 text-cyber-green animate-spin" />
          </div>
          <h2 className="text-cyber-green text-xl font-mono animate-pulse">
            Initializing AI Systems
          </h2>
          <div className="w-48 h-1 bg-cyber-dark mx-auto mt-4 overflow-hidden rounded-full">
            <div className="h-full bg-cyber-green animate-laser-line"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative">
      <CyberBackground />
      
      <CyberHeader />
      
      <main className="flex-grow">
        <section className="py-16 md:py-24 px-4 relative">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 cyber-text-gradient leading-tight">
              AI Source Intelligence
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Cutting-edge AI research tool that retrieves, verifies, and summarizes credible sources with blockchain security.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
              <Link
                to="/hub"
                className="cyber-button group text-lg py-3 px-8 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Researching <Zap className="ml-2 w-5 h-5 animate-pulse" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyber-green to-cyber-green/70 opacity-80 group-hover:opacity-100 transition-opacity"></span>
              </Link>
              
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
                className="cyber-button-outline text-lg py-3 px-8 flex items-center justify-center group"
              >
                Explore Features <ArrowDown className="ml-2 w-5 h-5 group-hover:animate-bounce" />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-8 md:gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40">
                  <Database className="text-cyber-green w-5 h-5" />
                </div>
                <p className="text-white/70 text-sm">100K+ Sources</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40">
                  <Shield className="text-cyber-green w-5 h-5" />
                </div>
                <p className="text-white/70 text-sm">Blockchain Verified</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40">
                  <Bot className="text-cyber-green w-5 h-5" />
                </div>
                <p className="text-white/70 text-sm">AI Powered</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyber-dark to-transparent"></div>
        </section>
        
        <CyberSearch />
        <CyberResults />

        {/* Three.js Scene with improved container */}
        <div className="max-w-5xl mx-auto mb-24 px-4">
          <div className="cyber-card h-[300px] md:h-[500px] overflow-hidden relative rounded-xl border-cyber-green/20">
            <div className="absolute inset-0">
              <CyberThreeScene />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-cyber-dark/90 to-transparent p-8">
              <div className="max-w-md text-left">
                <h3 className="text-2xl md:text-4xl font-bold mb-4 cyber-text-gradient">
                  AI Visualization
                </h3>
                <p className="text-white/70 mb-6 text-lg">
                  Experience the power of our AI as it processes information across the digital frontier.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="cyber-badge inline-block">Real-time Processing</div>
                  <div className="cyber-badge inline-block">AI Rendering</div>
                  <div className="cyber-badge inline-block">Data Mapping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="features">
          <CyberFeatures />
        </div>
      </main>
      
      <div id="about" className="w-full max-w-5xl mx-auto px-4 py-24">
        <div className="cyber-card p-8 md:p-12 rounded-xl border-cyber-cyan/20 bg-gradient-to-br from-cyber-dark to-cyber-dark/80">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 cyber-text-gradient">
            About Source Finder
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Source Finder is an advanced AI-powered research tool that combines neural networks, blockchain verification, and decentralized storage to provide the most credible and trustworthy sources for your research queries.
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Our mission is to combat misinformation and provide researchers, journalists, and curious minds with verified information sources they can trust, all wrapped in a cyberpunk-inspired interface that makes research feel like a journey through the digital frontier.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="border border-white/10 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <h4 className="font-bold text-cyber-cyan mb-2">Neural Source Verification</h4>
                <p className="text-white/70">Our advanced neural networks analyze sources across multiple dimensions to determine credibility.</p>
              </div>
              
              <div className="border border-white/10 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <h4 className="font-bold text-cyber-magenta mb-2">Blockchain Immutability</h4>
                <p className="text-white/70">Each verified source is registered on our private blockchain, ensuring no unauthorized modifications.</p>
              </div>
              
              <div className="border border-white/10 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <h4 className="font-bold text-cyber-green mb-2">Decentralized Storage</h4>
                <p className="text-white/70">Sources are stored across a decentralized network, making them resilient to censorship and data loss.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/hub"
              className="cyber-button py-3 px-8 text-lg inline-flex items-center group"
            >
              <span>Start Your Research Journey</span>
              <ArrowDown className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
      
      <CyberFooter />
    </div>
  );
};

export default Index;
