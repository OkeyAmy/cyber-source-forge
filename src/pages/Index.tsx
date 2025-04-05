
import React, { useEffect, useState } from 'react';
import CyberBackground from '@/components/CyberBackground';
import CyberHeader from '@/components/CyberHeader';
import CyberSearch from '@/components/CyberSearch';
import CyberResults from '@/components/CyberResults';
import CyberFeatures from '@/components/CyberFeatures';
import CyberFooter from '@/components/CyberFooter';
import { Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Show welcome toast
      toast({
        title: "Neural Systems Online",
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
            Initializing Neural Systems
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
        <section className="py-16 px-4 relative">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 cyber-text-gradient">
              Neural Source Intelligence
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Cutting-edge AI research tool that retrieves, verifies, and summarizes credible sources with blockchain security.
            </p>
          </div>
        </section>
        
        <CyberSearch />
        <CyberResults />
        <CyberFeatures />
      </main>
      
      <div id="about" className="w-full max-w-4xl mx-auto px-4 py-16">
        <div className="cyber-card p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 cyber-text-gradient">
            About Source Finder
          </h2>
          <p className="text-white/80 mb-4">
            Source Finder is an advanced AI-powered research tool that combines neural networks, blockchain verification, and decentralized storage to provide the most credible and trustworthy sources for your research queries.
          </p>
          <p className="text-white/80">
            Our mission is to combat misinformation and provide researchers, journalists, and curious minds with verified information sources they can trust, all wrapped in a cyberpunk-inspired interface that makes research feel like a journey through the digital frontier.
          </p>
        </div>
      </div>
      
      <CyberFooter />
    </div>
  );
};

export default Index;
