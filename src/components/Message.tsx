import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { Shield } from 'lucide-react';
import { ChatMessage, BlockchainVerification as BlockchainVerificationType } from '@/types/chatTypes';
import { BlockchainVerification } from '@/components/BlockchainVerification';

interface MessageProps {
  message: ChatMessage;
  isLast?: boolean;
  isScrolling?: boolean;
  onReference?: (sourceNum: number) => void;
  className?: string;
}

export function Message({
  message,
  isLast = false,
  isScrolling = false,
  onReference,
  className = ''
}: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(isLast);
  const [verification, setVerification] = useState<BlockchainVerificationType | null>(null);
  
  // Format reference links
  const formatReferenceLinks = (text: string) => {
    // Convert markdown reference links [1], [2], etc. to clickable links
    return text.replace(/\[(\d+)\]/g, (match, p1) => {
      return `<a href="#source-${p1}" class="reference-link" data-source="${p1}">[${p1}]</a>`;
    });
  };
  
  // Setup intersection observer to detect when message enters viewport
  useEffect(() => {
    // Always mark the last message as visible
    if (isLast) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (messageRef.current) {
      observer.observe(messageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [isLast]);
  
  // Initialize Prism for syntax highlighting
  useEffect(() => {
    if (isVisible && !isScrolling) {
      Prism.highlightAllUnder(messageRef.current!);
    }
  }, [isVisible, isScrolling]);
  
  // Handle reference link clicks
  useEffect(() => {
    const handleReferenceClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('reference-link') && onReference) {
        e.preventDefault();
        const sourceNum = parseInt(target.getAttribute('data-source') || '0', 10);
        if (sourceNum > 0) {
          onReference(sourceNum);
        }
      }
    };
    
    messageRef.current?.addEventListener('click', handleReferenceClick);
    
    return () => {
      messageRef.current?.removeEventListener('click', handleReferenceClick);
    };
  }, [onReference]);
  
  // Simulated verification for demo - in real app, this would come from blockchain
  useEffect(() => {
    if (message.role === 'assistant' && message.id) {
      // Simulate blockchain verification
      setTimeout(() => {
        setVerification({
          hash: `0x${Math.random().toString(16).substring(2, 50)}`,
          timestamp: new Date().toISOString(),
          network: 'Ethereum',
          status: Math.random() > 0.2 ? 'verified' : Math.random() > 0.5 ? 'pending' : 'failed',
          ipfsHash: `Qm${Math.random().toString(16).substring(2, 50)}`
        });
      }, 1500);
    }
  }, [message.id, message.role]);
  
  // Transition effect for messages
  const transitionClass = isVisible 
    ? 'opacity-100 transform translate-y-0' 
    : 'opacity-0 transform translate-y-4';

  return (
    <div 
      ref={messageRef}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${transitionClass} transition-all duration-300 ${className}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
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
        <div className="flex flex-col">
          {/* Blockchain verification badge for AI messages */}
          {message.role === 'assistant' && verification && (
            <div className="mb-2 flex justify-start">
              <BlockchainVerification 
                verification={verification} 
                showDetails={false}
              />
            </div>
          )}
          
          {/* Message bubble */}
          <div 
            className={`rounded-xl p-4 ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20 text-white' 
                : 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-green-600/20 text-white/90'
            }`}
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
                    code: ({ node, inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      
                      if (inline) {
                        return (
                          <code className="bg-cyber-dark/70 text-cyber-green px-1 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }
                      
                      return (
                        <div className="relative group my-4">
                          <div className="absolute top-0 right-0 bg-cyber-dark/80 text-xs text-white/60 px-2 py-1 rounded-bl-md rounded-tr-md border-l border-b border-cyber-green/20">
                            {language || 'code'}
                          </div>
                          <pre className="bg-cyber-dark/70 text-white/80 p-4 pt-8 rounded-md overflow-x-auto text-sm font-mono border border-cyber-green/20">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }
                  }}
                />
              </div>
            ) : (
              <p>{message.content}</p>
            )}
            
            {/* Source citations */}
            {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <h4 className="text-xs font-medium text-white/60 mb-2">Sources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {message.sources.map((source) => (
                    <div 
                      key={source.num}
                      id={`source-${source.num}`}
                      className="bg-cyber-dark/40 border border-cyber-green/10 rounded-md p-2 flex items-start"
                    >
                      <span className="bg-cyber-green/20 text-cyber-green h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        {source.num}
                      </span>
                      <div>
                        <p className="font-medium line-clamp-1">{source.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">{source.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          {message.timestamp && (
            <div className={`text-[10px] text-white/40 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 