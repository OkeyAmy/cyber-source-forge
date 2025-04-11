import React from 'react';
import { Shield, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void;
}

function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const suggestions = [
    "Tell me about recent advancements in quantum computing", 
    "What are the environmental impacts of blockchain?", 
    "What's the evidence for and against artificial superintelligence risks?",
    "How effective are current treatments for long COVID?"
  ];
  
  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };
  
  return (
    <div className="h-full flex flex-col items-center justify-center text-white/40 max-w-md mx-auto text-center p-6">
      <div className="w-20 h-20 border-2 border-cyber-green/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,170,0.2)] animate-pulse">
        <Shield className="h-10 w-10 text-cyber-green/50" />
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-white/90">Welcome to Source Finder</h3>
      <p className="mb-8 text-white/70 leading-relaxed">
        Ask any research question and I'll find verified sources with accurate information from across the web. Our AI analyzes and validates each source for credibility.
      </p>
      
      <div className="grid grid-cols-1 gap-3 w-full">
        {suggestions.map((suggestion, idx) => (
          <Button 
            key={idx}
            variant="outline" 
            className="text-left justify-start h-auto py-3 border-white/10 hover:border-cyber-green/40 bg-white/5 hover:bg-white/10 transition-all group"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0 text-cyber-green group-hover:translate-x-1 transition-transform" />
            <span className="line-clamp-1">{suggestion}</span>
          </Button>
        ))}
      </div>
      
      {/* Feature highlights */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyber-green/20 transition-all">
          <Sparkles className="h-5 w-5 text-cyber-green mb-2" />
          <h4 className="text-sm font-medium text-white mb-1">Source Verification</h4>
          <p className="text-xs text-white/60">Automatically checks information against verified sources</p>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyber-green/20 transition-all">
          <Shield className="h-5 w-5 text-cyber-green mb-2" />
          <h4 className="text-sm font-medium text-white mb-1">Credibility Analysis</h4>
          <p className="text-xs text-white/60">Evaluates the reliability of each source</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen; 