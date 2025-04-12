import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingState } from '@/components/LoadingState';
import { ChatMessage } from '@/types/chatTypes';

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
  const [inputValue, setInputValue] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
      setInputValue('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
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
    }
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom(messages.length > 0 ? 'smooth' : 'auto');
  }, [messages]);
  
  // Apply scrolled-up detection
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Create a formatter for reference links
  const formatReferenceLinks = (text: string) => {
    // Convert markdown reference links [1], [2], etc. to clickable links
    return text.replace(/\[(\d+)\]/g, (match, p1) => {
      return `<a href="#source-${p1}" class="reference-link">[${p1}]</a>`;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-cyber-green/20 scrollbar-track-transparent" 
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 px-4 py-12">
            <div className="max-w-md text-center">
              <h3 className="text-lg font-medium text-cyber-green mb-2">Welcome to CyberSourceForge</h3>
              <p className="text-sm mb-6">
                Ask me any question, and I'll provide a fact-checked answer with verified sources.
              </p>
              <div className="grid grid-cols-1 gap-2 text-left text-sm">
                <div className="bg-cyber-dark/40 border border-cyber-green/20 rounded-lg p-3 hover:bg-cyber-dark/60 transition cursor-pointer">
                  "What is a zero-day exploit and how do they work?"
                </div>
                <div className="bg-cyber-dark/40 border border-cyber-green/20 rounded-lg p-3 hover:bg-cyber-dark/60 transition cursor-pointer">
                  "Explain the differences between symmetric and asymmetric encryption."
                </div>
                <div className="bg-cyber-dark/40 border border-cyber-green/20 rounded-lg p-3 hover:bg-cyber-dark/60 transition cursor-pointer">
                  "What are the most common phishing tactics in 2023?"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-700 ml-3' 
                      : 'bg-gradient-to-br from-[#00aa77] to-[#005544] mr-3'}`
                  }>
                    <span className="text-xs text-white font-medium">
                      {message.role === 'user' ? 'U' : 'AI'}
                    </span>
                  </div>
                  
                  {/* Message content */}
                  <div 
                    className={`rounded-xl p-4 
                      ${message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20 text-white' 
                        : 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-green-600/20 text-white/90'}`
                    }
                  >
                    {message.role === 'assistant' ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          children={message.content}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => {
                              const processedChildren = formatReferenceLinks(props.children as string);
                              return <p dangerouslySetInnerHTML={{ __html: processedChildren }} />;
                            },
                            a: ({ node, ...props }) => (
                              <a 
                                {...props} 
                                className="text-cyber-green hover:underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                              />
                            ),
                            code: ({ node, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && (className || '').includes('inline');
                              
                              return isInline ? (
                                <code className="bg-cyber-dark/70 text-cyber-green px-1 py-0.5 rounded text-sm" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-cyber-dark/70 text-white/80 p-4 rounded-md overflow-x-auto my-3 text-sm">
                                  <code className={match ? `language-${match[1]}` : ''} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              );
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row">
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
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button 
          onClick={() => scrollToBottom()}
          className="fixed bottom-24 right-8 bg-cyber-green text-cyber-dark rounded-full p-3 shadow-lg hover:bg-cyber-green/80 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center animate-bounce-slow"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
          <span className="sr-only">Scroll to latest messages</span>
        </button>
      )}
      
      {/* Input area */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-t from-cyber-dark/80 to-transparent">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 resize-none min-h-[50px] max-h-[200px] bg-cyber-dark/50 text-white border-cyber-green/20 focus:border-cyber-green/50 rounded-xl"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-cyber-green text-cyber-dark hover:bg-cyber-green/80 self-end h-[50px] w-[50px]"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
      <style>{`
        .markdown-content {
          line-height: 1.6;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .markdown-content h1 {
          font-size: 1.5em;
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
        }
        .markdown-content li {
          margin-bottom: 0.3em;
        }
        .reference-link {
          color: #00ffaa;
          cursor: pointer;
          font-weight: bold;
          padding: 0 2px;
          border-radius: 3px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .reference-link:hover {
          background-color: rgba(0, 255, 170, 0.2);
          text-decoration: underline;
        }
        
        /* Custom scrollbar for modern browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(0, 255, 170, 0.2);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 255, 170, 0.4);
        }
      `}</style>
    </div>
  );
} 