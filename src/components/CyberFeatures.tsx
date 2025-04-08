
import React, { useState } from 'react';
import { Search, Shield, Database, Bot, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: <Search className="w-12 h-12 text-cyber-magenta group-hover:scale-110 transition-transform duration-300" />,
    title: "AI Source Detection",
    description: "Powerful AI algorithms scan and retrieve the most relevant and credible sources for your research query.",
    details: [
      "Neural network powered source analysis",
      "Real-time web scanning",
      "Contextual relevance scoring"
    ]
  },
  {
    icon: <Shield className="w-12 h-12 text-cyber-cyan group-hover:scale-110 transition-transform duration-300" />,
    title: "Blockchain Verification",
    description: "Decentralized verification system ensures the authenticity and reliability of every source.",
    details: [
      "Immutable source verification",
      "Cryptographic proof of authenticity", 
      "Transparent verification ledger"
    ]
  },
  {
    icon: <Database className="w-12 h-12 text-cyber-green group-hover:scale-110 transition-transform duration-300" />,
    title: "Secure Data Storage",
    description: "Your research data is securely stored with advanced encryption and decentralized storage protocols.",
    details: [
      "End-to-end encryption",
      "Decentralized storage network",
      "Permanent source archiving"
    ]
  },
  {
    icon: <Bot className="w-12 h-12 text-cyber-magenta group-hover:scale-110 transition-transform duration-300" />,
    title: "AI-Powered Analysis",
    description: "Intelligent analysis of sources with detailed summaries and key insights extraction.",
    details: [
      "Automated content summarization",
      "Key information extraction",
      "Cross-reference analysis"
    ]
  }
];

const CyberFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  
  return (
    <section id="features" className="w-full py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-radial opacity-20"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 cyber-text-gradient inline-block">
            Quantum Source Technology
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyber-green via-cyber-cyan to-cyber-magenta mx-auto mt-4"></div>
          <p className="text-white/70 max-w-2xl mx-auto mt-6 text-lg">
            Experience the future of research with our revolutionary AI and blockchain technologies that redefine how information is discovered and verified.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-cyber-dark rounded-lg glassmorphism p-6 transition-all duration-300 hover:translate-y-[-5px] border border-white/5 hover:border-cyber-cyan/30 hover:shadow-[0_10px_25px_rgba(0,255,157,0.2)]"
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-radial opacity-30"></div>
              
              <div className="mb-6 relative">
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-cyber-dark rounded-full flex items-center justify-center border border-white/10 group-hover:border-cyber-green/50 transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="w-16 h-16"></div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyber-green transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-white/70 text-sm mb-4">
                {feature.description}
              </p>
              
              <div className={`overflow-hidden transition-all duration-300 ${activeFeature === index ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="space-y-2 pt-2 border-t border-white/10">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start text-xs text-white/60">
                      <CheckCircle className="w-3 h-3 text-cyber-green mt-0.5 mr-2 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end mt-4">
                <button className="text-cyber-green flex items-center text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowRight className="ml-1 w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CyberFeatures;
