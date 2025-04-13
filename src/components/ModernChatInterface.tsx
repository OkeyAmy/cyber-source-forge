import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SourceType } from '@/types/chatTypes';
import { ArrowDown, PanelRightOpen, MessageSquare } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import SourcesPanel from './SourcesPanel';
import { LoadingState } from './LoadingState';
import SourceCard from './SourceCard';

interface ModernChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage: string;
  error?: string | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => Promise<void>;
  allSources: SourceType[];
  isSourcesLoading: boolean;
}

function ModernChatInterface({
  messages,
  isLoading,
  loadingMessage,
  error,
  inputValue,
  setInputValue,
  handleSendMessage,
  allSources,
  isSourcesLoading
}: ModernChatInterfaceProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'sources'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Detect when user has scrolled up from bottom
  const handleScroll = () => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLElement;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    }
  };
  
  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        handleSendMessage();
      }
    }
  };
  
  // Render Welcome Screen if no messages
  const renderWelcomeScreen = () => {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/70 px-4 py-12">
        <div className="max-w-md text-center">
          <h3 className="text-xl font-medium text-cyber-green mb-4">
            Welcome to SourceFinder
          </h3>
          <p className="text-sm mb-8 text-gray-300">
            Ask any question, and get answers with verified sources from across the web.
            Our cyberpunk-themed interface is designed to help you find credible information.
          </p>
          <div className="grid grid-cols-1 gap-3 text-left text-sm">
            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/80 hover:from-gray-800/80 hover:to-gray-900 hover:border-cyber-green/30 text-white/80 hover:text-white"
              onClick={() => {
                setInputValue("What is quantum computing and how does it work?");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              "What is quantum computing and how does it work?"
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/80 hover:from-gray-800/80 hover:to-gray-900 hover:border-cyber-green/30 text-white/80 hover:text-white"
              onClick={() => {
                setInputValue("Compare traditional banking with decentralized finance");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              "Compare traditional banking with decentralized finance"
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/80 hover:from-gray-800/80 hover:to-gray-900 hover:border-cyber-green/30 text-white/80 hover:text-white"
              onClick={() => {
                setInputValue("What are the most common cybersecurity threats in 2025?");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              "What are the most common cybersecurity threats in 2025?"
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col">
              {/* Chat messages */}
              <ScrollArea 
                ref={scrollAreaRef} 
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent" 
                onScrollCapture={handleScroll}
              >
                <div className="flex flex-col min-h-full pb-6 px-3 md:px-8 lg:px-16 max-w-5xl mx-auto w-full">
                  {/* Start of conversation indicator */}
                  {messages.length > 0 && (
                    <div className="flex justify-center my-6">
                      <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Start of conversation</span>
                      </div>
                    </div>
                  )}
                  
                  {/* If no messages, show welcome screen */}
                  {messages.length === 0 && !isLoading ? renderWelcomeScreen() : (
                    // Otherwise, render messages
                    <>
                      {messages.map((message, idx) => (
                        <React.Fragment key={idx}>
                          {/* Add timestamp separator for message groups */}
                          {idx > 0 && 
                            message.timestamp && 
                            messages[idx-1].timestamp && 
                            new Date(message.timestamp).getDate() !== new Date(messages[idx-1].timestamp as string).getDate() && (
                            <div className="flex justify-center my-5">
                              <div className="text-xs text-white/60 bg-gray-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
                                {new Date(message.timestamp).toLocaleDateString(undefined, { 
                                  weekday: 'long', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          )}
                        
                          {/* Message bubble */}
                          <div className={cn(
                            "mb-4",
                            message.role === 'assistant' && "mb-5",
                            idx > 0 && messages[idx-1].role === message.role && "mt-1"
                          )}>
                            <MessageBubble 
                              message={message} 
                              isLatest={idx === messages.length - 1} 
                            />
                          </div>
                          
                          {/* Sources panel with improved positioning and styling */}
                          {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                            <div className="mb-8 max-w-4xl mx-auto w-full">
                              <SourcesPanel sources={message.sources} />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                      
                      {/* Loading indicator */}
                      {isLoading && (
                        <div className="mt-2 mb-6">
                          <LoadingState 
                            message={loadingMessage} 
                            phase={0} 
                          />
                        </div>
                      )}
                    </>
                  )}
                  
                  <div ref={messagesEndRef} className="h-6" aria-hidden="true"></div>
                </div>
              </ScrollArea>
              
              {/* Input area */}
              <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black to-transparent backdrop-blur-md">
                <div className="max-w-5xl mx-auto">
                  <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading}
                    placeholder="Ask about any topic for verified sources..." 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Sources Tab Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-5xl mx-auto">
                  <h2 className="text-lg font-semibold text-white mb-4">All Sources</h2>
                  
                  {isSourcesLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="text-white/70 flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/20 border-t-cyber-green rounded-full"></div>
                        Loading sources...
                      </div>
                    </div>
                  ) : allSources.length === 0 ? (
                    <div className="text-center py-10 text-white/50">
                      <p>No sources available yet. Start a conversation to generate sources.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allSources.map((source, index) => (
                        <SourceCard key={index} source={source} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            className="absolute bottom-20 right-5 rounded-full h-10 w-10 p-0 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg transition-all duration-200 border border-white/20"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-5 w-5 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default ModernChatInterface;