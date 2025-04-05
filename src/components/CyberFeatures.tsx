
import React from 'react';
import { Search, Shield, Database, Bot } from 'lucide-react';

const features = [
  {
    icon: <Search className="w-10 h-10 text-cyber-magenta" />,
    title: "Neural Source Detection",
    description: "Powerful AI algorithms scan and retrieve the most relevant and credible sources for your research query."
  },
  {
    icon: <Shield className="w-10 h-10 text-cyber-cyan" />,
    title: "Blockchain Verification",
    description: "Decentralized verification system ensures the authenticity and reliability of every source. (Coming Soon)"
  },
  {
    icon: <Database className="w-10 h-10 text-cyber-green" />,
    title: "Secure Data Storage",
    description: "Your research data is securely stored with advanced encryption and decentralized storage protocols."
  },
  {
    icon: <Bot className="w-10 h-10 text-cyber-magenta" />,
    title: "AI-Powered Analysis",
    description: "Intelligent analysis of sources with detailed summaries and key insights extraction."
  }
];

const CyberFeatures: React.FC = () => {
  return (
    <section id="features" className="w-full py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-radial opacity-20"></div>
      
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 cyber-text-gradient text-center">
          Quantum Source Technology
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-cyber-dark rounded-lg glassmorphism p-6 transition-all duration-300 hover:translate-y-[-5px] border border-white/5 hover:border-cyber-cyan/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-radial opacity-30"></div>
              
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 w-12 h-12 bg-cyber-dark rounded-full flex items-center justify-center border border-white/10">
                  {feature.icon}
                </div>
                <div className="w-16 h-16"></div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white">
                {feature.title}
              </h3>
              
              <p className="text-white/70 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CyberFeatures;
