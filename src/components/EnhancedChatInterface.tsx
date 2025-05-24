
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SourceType } from '@/types/chatTypes';
import { ArrowDown, Send, Loader } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import SourcesPanel from './SourcesPanel';
import LoadingMessage from './LoadingMessage';

interface EnhancedChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage: string;
  loadingPhase: number;
  onSendMessage: (message: string) => void;
  allSources: SourceType[];
}

function EnhancedChatInterface({
  messages,
  isLoading,
  loadingMessage,
  loadingPhase,
  onSendMessage,
  allSources
}: EnhancedChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Handle scroll detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };
  
  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Chat Messages Container - Fixed scrolling */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/70 px-4 py-12">
              <div className="max-w-md text-center">
                <h3 className="text-xl font-medium text-cyber-green mb-4">
                  Welcome to SourceFinder AI
                </h3>
                <p className="text-sm mb-8 text-gray-300">
                  Ask any question and get answers with verified sources from across the web.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <div key={idx} className="space-y-4">
                  <MessageBubble 
                    message={message} 
                    isLatest={idx === messages.length - 1} 
                  />
                  
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                      <SourcesPanel sources={message.sources} />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="mt-4">
                  <LoadingMessage 
                    message={loadingMessage} 
                    phase={loadingPhase} 
                  />
                </div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
      
      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-white/10 bg-black/50 backdrop-blur-md p-4">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any topic for verified sources..."
              className="min-h-[44px] max-h-32 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 resize-none pr-12"
              disabled={isLoading}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-cyber-green hover:bg-cyber-green/80 text-black font-medium h-11 px-6"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 rounded-full h-10 w-10 p-0 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg"
        >
          <ArrowDown className="h-5 w-5 text-white" />
        </Button>
      )}
    </div>
  );
}

export default EnhancedChatInterface;
