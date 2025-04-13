import React, { useState } from 'react';
import ModernChatInterface from './ModernChatInterface';
import { ChatMessage, SourceReference } from '@/types/chatTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Example implementation showing how to use the ModernChatInterface component
 */
const EnhancedChatExample: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing your query...');
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  // Demo sources for responses
  const demoSources: SourceReference[] = [
    {
      num: 1,
      title: "Quantum Computing Recent Advances",
      link: "https://example.com/quantum-computing",
      source: "Academic",
      preview: "Recent developments in quantum computing show promising results in solving complex problems that are intractable for classical computers."
    },
    {
      num: 2,
      title: "Environmental Impact of Blockchain Technologies",
      link: "https://example.com/blockchain-environment",
      source: "News",
      preview: "A study published in Nature Climate Change examines the carbon footprint of different consensus mechanisms in blockchain networks."
    },
    {
      num: 3,
      title: "Reddit Discussion on AI Safety",
      link: "https://reddit.com/r/aisafety",
      source: "Reddit",
      preview: "User experiences and discussions about the potential risks and benefits of advanced AI systems."
    }
  ];
  
  // Handle sending a new message
  const handleSendMessage = (messageText: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response with loading states
    setTimeout(() => {
      setLoadingMessage('Searching for sources...');
      setLoadingPhase(1);
    }, 1000);
    
    setTimeout(() => {
      setLoadingMessage('Analyzing credibility...');
      setLoadingPhase(2);
    }, 2500);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: generateAIResponse(messageText),
        timestamp: new Date().toISOString(),
        sources: demoSources
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setLoadingPhase(0);
      setLoadingMessage('Processing your query...');
    }, 3500);
  };
  
  // Generate a simulated AI response based on user input
  const generateAIResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('quantum') || lowercaseMessage.includes('computing')) {
      return "Recent advances in quantum computing have shown significant progress. Research at leading institutions has demonstrated quantum advantage in specific computational tasks [1].\n\nQuantum computers are now capable of performing certain calculations that would be practically impossible for classical supercomputers. However, practical, general-purpose quantum computers are still years away from widespread deployment [2].\n\nThe quantum computing industry has seen substantial investment, with both private companies and governments funding research and development [3].";
    }
    
    if (lowercaseMessage.includes('blockchain') || lowercaseMessage.includes('environment')) {
      return "Blockchain technology, particularly proof-of-work consensus mechanisms, has been criticized for its environmental impact. Bitcoin mining alone consumes more electricity than some medium-sized countries [2].\n\nHowever, more energy-efficient alternatives like proof-of-stake are gaining adoption. Ethereum's transition to proof-of-stake reduced its energy consumption by approximately 99.95% [1].\n\nSome blockchain projects are specifically focusing on solving environmental challenges, including carbon credit tracking, renewable energy certificate trading, and supply chain sustainability verification [3].";
    }
    
    if (lowercaseMessage.includes('ai') || lowercaseMessage.includes('risk') || lowercaseMessage.includes('superintelligence')) {
      return "The risks associated with advanced AI systems are a topic of growing concern among researchers. These include potential misalignment with human values, unintended consequences from optimization processes, and security vulnerabilities [1].\n\nMany experts advocate for responsible AI development practices, including transparency in AI systems, robust safety measures, and international coordination on AI governance [2].\n\nWhile some risks are speculative, concrete challenges already exist around bias in AI systems, privacy concerns, and potential for misuse [3].";
    }
    
    // Default response
    return "Thank you for your question. Based on verified sources, I can provide you with accurate information on this topic.\n\nThe research literature indicates several key perspectives [1]. Experts in the field have conducted numerous studies to better understand this area [2].\n\nRecent developments suggest that further research is needed, but current evidence points toward several promising directions for future work [3].";
  };
  
  // Handle reference clicks
  const handleReferenceClick = (reference: string) => {
    const sourceNumber = parseInt(reference);
    if (!isNaN(sourceNumber) && sourceNumber > 0 && sourceNumber <= demoSources.length) {
      const source = demoSources[sourceNumber - 1];
      toast({
        title: `Source #${sourceNumber}`,
        description: `${source.title} - ${source.source}`
      });
    }
  };
  
  // Handle exporting chat
  const handleExportChat = () => {
    toast({
      title: "Chat Exported",
      description: "Your conversation has been saved as a JSON file."
    });
  };

  return (
    <div className="h-[80vh] border border-cyber-green/30 rounded-lg shadow-glow-sm">
      <ModernChatInterface
        messages={messages}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        loadingPhase={loadingPhase}
        onSendMessage={handleSendMessage}
        onReferenceClick={handleReferenceClick}
        onExportChat={handleExportChat}
      />
    </div>
  );
};

export default EnhancedChatExample;