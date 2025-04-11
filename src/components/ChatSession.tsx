import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '@/types/chatTypes';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SourcesPanel from './SourcesPanel';
import WelcomeScreen from './WelcomeScreen';
import LoadingMessage from './LoadingMessage';
import { cn } from '@/lib/utils';

interface ChatSessionProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage: string;
  loadingPhase: number;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

function ChatSession({ 
  messages, 
  isLoading, 
  loadingMessage,
  loadingPhase,
  onSuggestionClick,
  className 
}: ChatSessionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Debug log to check messages being received
  useEffect(() => {
    console.log('ChatSession received messages:', messages);
  }, [messages]);
  
  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingPhase]);
  
  // Add scroll event listener to show/hide scroll button
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    
    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLElement;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        setShowScrollButton(isScrolledUp);
      };
      
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);
  
  const scrollToBottom = () => {
    // Use a small timeout to ensure DOM is updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      
      // Force scroll to bottom for ScrollArea component
      const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
      
      setShowScrollButton(false);
    }, 100);
  };
  
  // If no messages and not loading, show welcome screen
  if (messages.length === 0 && !isLoading) {
    return <WelcomeScreen onSuggestionClick={onSuggestionClick} />;
  }
  
  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Debug info - only in dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="sticky top-0 z-50 bg-red-800/30 p-1 text-xs text-white">
          Messages: {messages.length} (User: {messages.filter(m => m.role === 'user').length}, 
          AI: {messages.filter(m => m.role === 'assistant').length})
        </div>
      )}
      
      {/* Date separator - useful when showing multi-day conversations */}
      {messages.length > 0 && (
        <div className="sticky top-0 z-10 flex justify-center py-2 bg-gradient-to-b from-cyber-dark to-transparent">
          <div className="text-xs text-white/50 bg-cyber-dark/80 px-3 py-1 rounded-full border border-white/10">
            {messages[0].timestamp 
              ? new Date(messages[0].timestamp).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                }) 
              : 'Today'}
          </div>
        </div>
      )}

      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 bg-gradient-to-b from-cyber-dark to-cyber-dark/90 overflow-y-auto"
      >
        <div 
          className="flex flex-col min-h-full pb-4 px-2 md:px-6"
          role="log"
          aria-label="Chat conversation"
          aria-live="polite"
        >
          {/* Start of conversation indicator */}
          {messages.length > 0 && (
            <div className="flex justify-center my-4">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <MessageSquare className="h-3 w-3" />
                <span>Start of conversation</span>
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          {messages.map((message, idx) => (
            <React.Fragment key={idx}>
              {/* Add timestamp separator for message groups */}
              {idx > 0 && 
                message.timestamp && 
                messages[idx-1].timestamp && 
                new Date(message.timestamp).getDate() !== new Date(messages[idx-1].timestamp as string).getDate() && (
                <div className="flex justify-center my-4">
                  <div className="text-xs text-white/50 bg-cyber-dark/80 px-3 py-1 rounded-full border border-white/10">
                    {new Date(message.timestamp).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}
            
              {/* Message bubble */}
              <MessageBubble 
                message={message} 
                isLatest={idx === messages.length - 1} 
              />
              
              {/* Sources panel - only for assistant messages with sources */}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <div className="ml-14 mr-8 -mt-2 mb-4">
                  <SourcesPanel sources={message.sources} />
                </div>
              )}
            </React.Fragment>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <LoadingMessage 
              message={loadingMessage} 
              phase={loadingPhase} 
            />
          )}
          
          <div ref={messagesEndRef} className="h-4" aria-hidden="true"></div>
        </div>
      </ScrollArea>
      
      {/* Scroll to bottom button - only visible when scrolled up */}
      {showScrollButton && (
        <Button
          className="absolute bottom-4 right-4 rounded-full h-10 w-10 p-0 bg-cyber-green/90 hover:bg-cyber-green shadow-[0_0_15px_rgba(0,255,170,0.3)] transition-all"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5 text-black" />
        </Button>
      )}
    </div>
  );
}

export default ChatSession; 