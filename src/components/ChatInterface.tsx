import React, { useState, useRef, useEffect } from 'react';
import ChatInput from '@/components/ChatInput';
import { ArrowDown, PanelRightOpen, X } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { ChatMessage, ContextPanelState, SmartSuggestion, BlockchainVerification as BlockchainVerificationType } from '@/types/chatTypes';
import { Message } from '@/components/Message';
import { ContextPanel } from '@/components/ContextPanel';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage: string;
  loadingPhase: number;
  onSubmit: (message: string) => void;
}

export function ChatInterface({
  messages,
  isLoading,
  loadingMessage,
  loadingPhase,
  onSubmit
}: ChatInterfaceProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [contextPanelState, setContextPanelState] = useState<ContextPanelState>({
    isOpen: false,
    activeTab: 'sources'
  });
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [verifications, setVerifications] = useState<BlockchainVerificationType[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };
  
  // Detect when user has scrolled up from bottom
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
      
      // Set scrolling state to optimize rendering
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 100);
    }
  };
  
  // Scroll timeout for debouncing scroll events
  let scrollTimeout: NodeJS.Timeout;
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom(messages.length > 0 ? 'smooth' : 'auto');
    
    // Generate smart suggestions based on the last message
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      generateSmartSuggestions(messages[messages.length - 1].content);
    }
  }, [messages]);
  
  // Apply scrolled-up detection
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Generate mock smart suggestions
  const generateSmartSuggestions = (lastMessage: string) => {
    // In a real app, these would be generated based on the content of the last message
    // using some form of AI or pattern matching
    const suggestionTypes = ['related', 'follow-up', 'clarification'] as const;
    const mockSuggestions: SmartSuggestion[] = [
      { id: '1', text: 'Tell me more about blockchain security', category: 'related' },
      { id: '2', text: 'How does this compare to traditional encryption?', category: 'follow-up' },
      { id: '3', text: 'Can you provide some real-world examples?', category: 'follow-up' },
      { id: '4', text: 'What are the main vulnerabilities?', category: 'related' },
      { id: '5', text: 'Could you explain that in simpler terms?', category: 'clarification' }
    ];
    
    // Shuffle and pick a random number of suggestions
    const shuffled = [...mockSuggestions].sort(() => 0.5 - Math.random());
    setSmartSuggestions(shuffled.slice(0, Math.floor(Math.random() * 3) + 2));
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SmartSuggestion) => {
    if (suggestion.text) {
      onSubmit(suggestion.text);
    }
  };
  
  // Handle reference click to open context panel
  const handleReferenceClick = (sourceNum: number) => {
    // Open context panel to sources tab
    setContextPanelState({
      isOpen: true,
      activeTab: 'sources'
    });
  };
  
  // Toggle context panel
  const toggleContextPanel = () => {
    setContextPanelState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };
  
  // Close context panel
  const closeContextPanel = () => {
    setContextPanelState(prev => ({
      ...prev,
      isOpen: false
    }));
  };
  
  // Handle context panel tab change
  const handleTabChange = (tab: 'sources' | 'verification' | 'search') => {
    setContextPanelState(prev => ({
      ...prev,
      activeTab: tab
    }));
  };
  
  // Handle search in context panel
  const handleSearch = (query: string) => {
    // In a real app, this would perform a search against your sources
    if (query.trim()) {
      setContextPanelState(prev => ({
        ...prev,
        searchQuery: query,
        searchResults: messages
          .filter(m => m.role === 'assistant' && m.sources)
          .flatMap(m => m.sources || [])
          .filter(s => 
            s.title.toLowerCase().includes(query.toLowerCase()) || 
            s.preview.toLowerCase().includes(query.toLowerCase())
          )
      }));
    }
  };
  
  // Get all sources from messages
  const getAllSources = () => {
    return messages
      .filter(m => m.role === 'assistant' && m.sources)
      .flatMap(m => m.sources || []);
  };
  
  // Get random verifications for demo
  useEffect(() => {
    // In a real app, these would come from your blockchain integration
    const mockVerifications: BlockchainVerificationType[] = [
      {
        hash: '0x3f5a21b9d9f0eabc35de7e024fdaa7a3d45c6c6f3d8c9a5ed4e2b0d4a39c5f7',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        network: 'Ethereum',
        status: 'verified',
        transactionId: '0x4d2c3a1e5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
        ipfsHash: 'QmT8B9ErUbzP7VWbjrVsqWHYe9UGptZPfG9xjw5xKC7GDA'
      },
      {
        hash: '0x2a4b6c8d0e2f4a6b8c0d2e4f6a8c0e2d4f6a8c0e2d4f6a8c0e2d4f6a8c0e2d4f',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        network: 'Polygon',
        status: 'verified',
        transactionId: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8',
      },
      {
        hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        network: 'Solana',
        status: 'pending',
      }
    ];
    
    setVerifications(mockVerifications);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Main layout with chat and context panel */}
      <div className="flex flex-1 h-[calc(100vh-60px)] relative">
        {/* Main chat area */}
        <div 
          className={cn(
            "flex flex-col flex-1 h-full transition-all duration-300",
            contextPanelState.isOpen 
              ? "md:pr-[380px]" // Make room for panel
              : "w-full"
          )}
        >
          {/* Messages area */}
          <div 
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent" 
            onScroll={handleScroll}
          >
            <div className="max-w-3xl mx-auto w-full">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/70 px-4 py-12">
                  <div className="max-w-md text-center">
                    <h3 className="text-xl font-medium text-cyber-green bg-gradient-to-r from-cyan-300 to-green-300 bg-clip-text text-transparent mb-4">
                      Welcome to CyberSourceForge
                    </h3>
                    <p className="text-sm mb-8 text-gray-300">
                      Ask me any question, and I'll provide a fact-checked answer with verified sources.
                    </p>
                    <div className="grid grid-cols-1 gap-3 text-left text-sm">
                      <Button
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/80 hover:from-gray-800/80 hover:to-gray-900 hover:border-cyber-green/30 text-white/80 hover:text-white"
                        onClick={() => onSubmit("What is a zero-day exploit and how do they work?")}
                      >
                        "What is a zero-day exploit and how do they work?"
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/80 hover:from-gray-800/80 hover:to-gray-900 hover:border-cyber-green/30 text-white/80 hover:text-white"
                        onClick={() => onSubmit("Explain the differences between symmetric and asymmetric encryption.")}
                      >
                        "Explain the differences between symmetric and asymmetric encryption."
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/80 hover:from-gray-800/80 hover:to-gray-900 hover:border-cyber-green/30 text-white/80 hover:text-white"
                        onClick={() => onSubmit("What are the most common phishing tactics in 2025?")}
                      >
                        "What are the most common phishing tactics in 2025?"
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* Render messages with progressive loading */}
                  {messages.map((message, index) => (
                    <Message 
                      key={message.id || index}
                      message={message}
                      isLast={index === messages.length - 1}
                      isScrolling={isScrolling}
                      onReference={handleReferenceClick}
                    />
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[90%] flex-row">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                          bg-gradient-to-br from-[#00aa77] to-[#005544] mr-3">
                          <span className="text-xs text-white font-medium">AI</span>
                        </div>
                        <div className="rounded-xl p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 
                          border border-green-600/20 text-white/90"
                        >
                          <LoadingState message={loadingMessage} phase={loadingPhase} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
          
          {/* Smart suggestions */}
          {smartSuggestions.length > 0 && !isLoading && messages.length > 0 && (
            <div className="px-4 md:px-6 mt-2">
              <div className="max-w-3xl mx-auto">
                <SmartSuggestions 
                  suggestions={smartSuggestions} 
                  onSelect={handleSuggestionSelect} 
                />
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="p-4 md:p-5 border-t border-white/10 bg-gradient-to-t from-black to-transparent backdrop-blur-md">
            <div className="max-w-3xl mx-auto flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleContextPanel}
                className={cn(
                  "border-white/10 text-white/60 hover:bg-white/5 self-end h-[40px] w-[40px] rounded-full",
                  contextPanelState.isOpen && "bg-white/10 text-white"
                )}
                aria-label={contextPanelState.isOpen ? "Close context panel" : "Open context panel"}
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
              
              <ChatInput
                onSendMessage={onSubmit}
                isLoading={isLoading}
                placeholder="Ask about any topic for verified sources..."
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        {/* Context panel - slide-in from the right */}
        <div 
          className={cn(
            "fixed top-0 right-0 h-full w-[380px] bg-gradient-to-br from-gray-900/95 to-black border-l border-white/10 z-40 transform transition-all duration-300 ease-in-out",
            contextPanelState.isOpen 
              ? "translate-x-0 shadow-[-10px_0px_40px_rgba(0,0,0,0.5)]" 
              : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-sm font-medium text-white">
                {contextPanelState.activeTab === 'sources' ? 'Sources' : 
                 contextPanelState.activeTab === 'verification' ? 'Verification' : 'Search'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeContextPanel}
                className="h-7 w-7 rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/70" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <ContextPanel 
                state={contextPanelState}
                sources={getAllSources()}
                verifications={verifications}
                onClose={closeContextPanel}
                onTabChange={handleTabChange}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={() => scrollToBottom()}
          className="fixed bottom-28 right-6 bg-white/10 text-white hover:bg-white/20 rounded-full h-10 w-10 p-0 shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
          <span className="sr-only">Scroll to latest messages</span>
        </Button>
      )}
      
      <style jsx global>{`
        /* Markdown content styles */
        .markdown-content {
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: rgba(255, 255, 255, 0.95);
        }
        .markdown-content h1 {
          font-size: 1.5em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.3em;
        }
        .markdown-content h2 {
          font-size: 1.3em;
        }
        .markdown-content h3 {
          font-size: 1.1em;
        }
        .markdown-content p {
          margin: 0.8em 0;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
          padding-left: 0.5em;
        }
        .markdown-content li {
          margin-bottom: 0.3em;
        }
        .markdown-content pre {
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.75em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .markdown-content code {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
          font-family: "SF Mono", Monaco, Consolas, monospace;
        }
        .markdown-content pre > code {
          background-color: transparent;
          padding: 0;
          font-size: 0.85em;
          color: rgba(255, 255, 255, 0.8);
        }
        .reference-link {
          color: #00ffaa;
          cursor: pointer;
          font-weight: 500;
          padding: 0 2px;
          border-radius: 3px;
          text-decoration: none;
          transition: all 0.2s;
          background-color: rgba(0, 255, 170, 0.1);
        }
        .reference-link:hover {
          background-color: rgba(0, 255, 170, 0.2);
          text-decoration: underline;
        }
        
        /* Scrollbar for Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(180, 180, 180, 0.2) transparent;
        }
        
        /* Scrollbar for Chrome, Edge, and Safari */
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: rgba(180, 180, 180, 0.2);
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(180, 180, 180, 0.3);
        }
        
        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
          .markdown-content code {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .reference-link {
            color: white;
            text-decoration: underline;
            background-color: rgba(0, 0, 0, 0.3);
          }
        }
        
        /* Reduced motion preference */
        @media (prefers-reduced-motion) {
          * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}