
import React, { useEffect, useState, useRef } from 'react';
import CyberBackground from '@/components/CyberBackground';
import CyberHeader from '@/components/CyberHeader';
import CyberSearch from '@/components/CyberSearch';
import CyberResults from '@/components/CyberResults';
import CyberFeatures from '@/components/CyberFeatures';
import CyberFooter from '@/components/CyberFooter';
import CyberThreeScene from '@/components/CyberThreeScene';
import { Bot, ArrowDown, Shield, Database, Zap, ChevronDown, Users, Code, FileCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sources: 0,
    users: 0,
    queries: 0,
    accuracy: 0
  });
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate stats counters
    const interval = setInterval(() => {
      setStats(prev => ({
        sources: Math.min(prev.sources + 1023, 100000),
        users: Math.min(prev.users + 89, 25000),
        queries: Math.min(prev.queries + 123, 500000),
        accuracy: Math.min(prev.accuracy + 1, 99)
      }));
    }, 30);

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Show welcome toast
      toast({
        title: "AI Systems Online",
        description: "Welcome to SourceFinder. Blockchain verification active.",
        variant: "default"
      });

      clearInterval(interval);
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast]);

  const scrollToContent = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <div className="w-64 h-1 bg-cyber-dark mx-auto mt-4 overflow-hidden rounded-full">
            <div className="h-full bg-cyber-green animate-laser-line"></div>
          </div>
          <div className="mt-4 text-white/50 text-sm">
            Neural networks calibrating...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative overflow-hidden">
      <CyberBackground />
      
      <CyberHeader />
      
      <main className="flex-grow pt-20">
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-40 pointer-events-none">
            <div className="w-[800px] h-[800px] border-2 border-cyber-green/20 rounded-full animate-rotate-slow"></div>
            <div className="absolute w-[600px] h-[600px] border-2 border-cyber-cyan/20 rounded-full animate-rotate-slow" style={{animationDirection: 'reverse'}}></div>
            <div className="absolute w-[400px] h-[400px] border-2 border-cyber-magenta/20 rounded-full animate-rotate-slow"></div>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 w-full text-center relative z-10 py-24 md:py-32">
            <div className="inline-block mb-6 relative">
              <span className="absolute -top-2 -left-2 w-3 h-3 bg-cyber-green animate-pulse-neon rounded-full"></span>
              <span className="absolute -top-2 -right-2 w-3 h-3 bg-cyber-cyan animate-pulse-neon rounded-full"></span>
              <span className="absolute -bottom-2 -left-2 w-3 h-3 bg-cyber-magenta animate-pulse-neon rounded-full"></span>
              <span className="absolute -bottom-2 -right-2 w-3 h-3 bg-cyber-green animate-pulse-neon rounded-full"></span>
              <div className="cyber-badge text-xl px-4 py-1 bg-white/5">REVOLUTIONARY</div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 cyber-text-gradient leading-tight max-w-4xl mx-auto">
              AI Source Intelligence<br />For The Digital Age
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Cutting-edge AI research tool that retrieves, verifies, and summarizes credible sources with blockchain security.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
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
                onClick={scrollToContent}
                className="cyber-button-outline text-lg py-3 px-8 flex items-center justify-center group"
              >
                Explore Features <ChevronDown className="ml-2 w-5 h-5 group-hover:animate-bounce" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyber-green/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40 mx-auto">
                  <Database className="text-cyber-green w-5 h-5" />
                </div>
                <div className="text-3xl font-bold cyber-text-gradient">{stats.sources.toLocaleString()}</div>
                <p className="text-white/70 text-sm">Verified Sources</p>
              </div>
              
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyber-green/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40 mx-auto">
                  <Users className="text-cyber-green w-5 h-5" />
                </div>
                <div className="text-3xl font-bold cyber-text-gradient">{stats.users.toLocaleString()}+</div>
                <p className="text-white/70 text-sm">Active Users</p>
              </div>
              
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyber-green/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40 mx-auto">
                  <Bot className="text-cyber-green w-5 h-5" />
                </div>
                <div className="text-3xl font-bold cyber-text-gradient">{stats.queries.toLocaleString()}+</div>
                <p className="text-white/70 text-sm">Research Queries</p>
              </div>
              
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyber-green/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center mb-2 border border-cyber-green/40 mx-auto">
                  <FileCheck className="text-cyber-green w-5 h-5" />
                </div>
                <div className="text-3xl font-bold cyber-text-gradient">{stats.accuracy}%</div>
                <p className="text-white/70 text-sm">Accuracy Rate</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
            <ArrowDown className="w-6 h-6 text-cyber-green" />
          </div>
        </section>
        
        <div ref={heroRef}>
          <CyberSearch />
          <CyberResults />
        </div>

        {/* Three.js Scene with improved container */}
        <div className="max-w-6xl mx-auto mb-24 px-4">
          <div className="cyber-card h-[350px] md:h-[500px] overflow-hidden relative rounded-xl border-cyber-green/20 group hover:border-cyber-green/40 transition-all duration-500">
            <div className="absolute inset-0 scale-[0.98] group-hover:scale-100 transition-transform duration-1000">
              <CyberThreeScene />
            </div>
            <div className="absolute inset-0 flex items-center bg-gradient-to-r from-cyber-dark/90 via-cyber-dark/80 to-transparent p-8 transition-opacity duration-500">
              <div className="max-w-md text-left">
                <div className="mb-4">
                  <div className="cyber-badge inline-block animate-pulse">INTERACTIVE DEMO</div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 cyber-text-gradient">
                  AI Visualization
                </h3>
                <p className="text-white/70 mb-6 text-lg leading-relaxed">
                  Experience the power of our AI as it processes information across the digital frontier, mapping connections between sources.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="cyber-badge inline-block">Real-time Processing</div>
                  <div className="cyber-badge inline-block">AI Rendering</div>
                  <div className="cyber-badge inline-block">Data Mapping</div>
                </div>
                <button className="cyber-button-outline">
                  <Code className="mr-2 w-4 h-4" /> View Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div id="features">
          <CyberFeatures />
        </div>
      </main>
      
      <div id="about" className="w-full max-w-6xl mx-auto px-4 py-24">
        <div className="cyber-card p-8 md:p-12 rounded-xl border-cyber-cyan/20 bg-gradient-to-br from-cyber-dark to-cyber-dark/80 relative overflow-hidden group hover:border-cyber-green/30 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(0,255,157,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-green/5 rounded-full blur-3xl -z-10 group-hover:bg-cyber-green/10 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-magenta/5 rounded-full blur-3xl -z-10 group-hover:bg-cyber-magenta/10 transition-colors duration-500"></div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="inline-block cyber-badge mb-4">ABOUT US</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 cyber-text-gradient">
                The Future of<br />Source Verification
              </h2>
              
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Source Finder is an advanced AI-powered research tool that combines neural networks, blockchain verification, and decentralized storage to provide the most credible and trustworthy sources for your research queries.
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Our mission is to combat misinformation and provide researchers, journalists, and curious minds with verified information sources they can trust, all wrapped in a cyberpunk-inspired interface that makes research feel like a journey through the digital frontier.
              </p>
            </div>
            
            <div className="md:w-1/2 space-y-4">
              <div className="border border-white/10 p-5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 hover:border-cyber-cyan/30 hover:translate-x-1 hover:-translate-y-1">
                <h4 className="font-bold text-cyber-cyan mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-cyber-cyan/20 flex items-center justify-center mr-2">
                    <Bot className="w-3 h-3 text-cyber-cyan" />
                  </span>
                  Neural Source Verification
                </h4>
                <p className="text-white/70">Our advanced neural networks analyze sources across multiple dimensions to determine credibility and relevance to your specific research needs.</p>
              </div>
              
              <div className="border border-white/10 p-5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 hover:border-cyber-magenta/30 hover:translate-x-1 hover:-translate-y-1">
                <h4 className="font-bold text-cyber-magenta mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-cyber-magenta/20 flex items-center justify-center mr-2">
                    <Shield className="w-3 h-3 text-cyber-magenta" />
                  </span>
                  Blockchain Immutability
                </h4>
                <p className="text-white/70">Each verified source is registered on our private blockchain, ensuring no unauthorized modifications can alter the integrity of your research data.</p>
              </div>
              
              <div className="border border-white/10 p-5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 hover:border-cyber-green/30 hover:translate-x-1 hover:-translate-y-1">
                <h4 className="font-bold text-cyber-green mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-cyber-green/20 flex items-center justify-center mr-2">
                    <Database className="w-3 h-3 text-cyber-green" />
                  </span>
                  Decentralized Storage
                </h4>
                <p className="text-white/70">Sources are stored across a decentralized network, making them resilient to censorship and data loss while ensuring perpetual access to your valuable findings.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/hub"
              className="cyber-button py-3 px-8 text-lg inline-flex items-center group"
            >
              <span className="relative z-10 flex items-center">
                Start Your Research Journey
                <ArrowDown className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              </span>
              <span className="absolute inset-0 w-0 bg-cyber-green/20 transition-all duration-500 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </div>
      
      <div id="docs" className="w-full max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <div className="inline-block cyber-badge mb-4">DOCUMENTATION</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 cyber-text-gradient">
            Developer Resources
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Integrate SourceFinder's powerful AI verification into your own applications with our comprehensive API documentation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cyber-card p-6 hover:border-cyber-green/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-cyber-green/10 transition-colors">
              <Code className="w-6 h-6 text-cyber-green" />
            </div>
            <h3 className="text-xl font-bold mb-2">API Reference</h3>
            <p className="text-white/70 text-sm mb-4">
              Complete documentation for integrating with our AI source verification endpoints.
            </p>
            <a href="#" className="text-cyber-green text-sm flex items-center">
              View documentation <ArrowDown className="ml-1 w-4 h-4 rotate-90" />
            </a>
          </div>
          
          <div className="cyber-card p-6 hover:border-cyber-green/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-cyber-green/10 transition-colors">
              <Bot className="w-6 h-6 text-cyber-green" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Guidelines</h3>
            <p className="text-white/70 text-sm mb-4">
              Learn how our AI algorithms determine source credibility and relevance.
            </p>
            <a href="#" className="text-cyber-green text-sm flex items-center">
              Read guidelines <ArrowDown className="ml-1 w-4 h-4 rotate-90" />
            </a>
          </div>
          
          <div className="cyber-card p-6 hover:border-cyber-green/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-cyber-green/10 transition-colors">
              <Shield className="w-6 h-6 text-cyber-green" />
            </div>
            <h3 className="text-xl font-bold mb-2">Security Whitepaper</h3>
            <p className="text-white/70 text-sm mb-4">
              Deep dive into our blockchain verification and security protocols.
            </p>
            <a href="#" className="text-cyber-green text-sm flex items-center">
              Download PDF <ArrowDown className="ml-1 w-4 h-4 rotate-90" />
            </a>
          </div>
        </div>
      </div>
      
      <CyberFooter />
    </div>
  );
};

export default Index;
