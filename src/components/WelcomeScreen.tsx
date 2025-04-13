import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onExampleClick: (query: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onExampleClick }) => {
  const examples = [
    {
      text: "Find academic sources about quantum computing applications",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      text: "What are the latest advancements in renewable energy?",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
    },
    {
      text: "Compare different approaches to cybersecurity in financial services",
      icon: <Shield className="h-4 w-4 mr-2" />,
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 h-full">
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-cyber-green/10 rounded-full border border-cyber-green/30">
          <svg className="w-8 h-8 text-cyber-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 19 21 12 17 5 21 12 2"/>
          </svg>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Welcome to SourceFinder AI</h1>
        
        <p className="text-white/70 mb-8 max-w-2xl mx-auto">
          Ask any question and I'll find verified, credible sources from across the web. 
          All sources are verified and can be directly referenced in your work.
        </p>
        
        <div className="grid gap-3">
          {examples.map((example, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="bg-white/5 border-white/10 hover:border-cyber-green/50 hover:bg-cyber-green/5 text-white justify-start text-left h-auto py-3 px-4"
              onClick={() => onExampleClick(example.text)}
            >
              {example.icon}
              <span>{example.text}</span>
            </Button>
          ))}
        </div>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/20 rounded-xl border border-white/10 p-4">
            <div className="bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Academic Sources</h3>
            <p className="text-white/60 text-sm">Access verified academic papers, journals, and research publications</p>
          </div>
          
          <div className="bg-black/20 rounded-xl border border-white/10 p-4">
            <div className="bg-orange-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M17.2 9.8C17.2 10.7941 16.3941 11.6 15.4 11.6C14.4059 11.6 13.6 10.7941 13.6 9.8C13.6 8.80589 14.4059 8 15.4 8C16.3941 8 17.2 8.80589 17.2 9.8Z" fill="currentColor"/>
                <path d="M9.2 14.4C9.2 15.3941 8.39411 16.2 7.4 16.2C6.40589 16.2 5.6 15.3941 5.6 14.4C5.6 13.4059 6.40589 12.6 7.4 12.6C8.39411 12.6 9.2 13.4059 9.2 14.4Z" fill="currentColor"/>
                <path d="M12 7.6L15.4 8L15.4 11.6L12 16.2L7.4 12.6V8L12 7.6Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Community Knowledge</h3>
            <p className="text-white/60 text-sm">Discover insights from Reddit, Twitter, and other community platforms</p>
          </div>
          
          <div className="bg-black/20 rounded-xl border border-white/10 p-4">
            <div className="bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Verified Results</h3>
            <p className="text-white/60 text-sm">All sources undergo blockchain verification for authenticity and reliability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;