
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/hooks/useChatHistory';
import HorizontalSourceScroller from './HorizontalSourceScroller';
import LoadingState from './LoadingState';
import { SourceType } from './SourceCard';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSourceClick?: (source: SourceType) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, onSourceClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6 p-4">
      {isLoading && messages.length === 0 ? (
        <LoadingState type="chat" count={3} />
      ) : (
        messages.map((msg, index) => (
          <div key={index} className="space-y-2">
            <div 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-2xl ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              <div 
                className={`rounded-lg p-4 ${
                  msg.role === 'user' 
                    ? 'bg-cyber-magenta/20 border border-cyber-magenta/40 text-white hover:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-shadow duration-300' 
                    : 'bg-cyber-dark/80 border border-cyber-green/40 text-white hover:shadow-[0_0_10px_rgba(0,255,157,0.2)] transition-shadow duration-300'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </div>
            
            {msg.sources && msg.sources.length > 0 && (
              <HorizontalSourceScroller
                sources={msg.sources}
                title="Sources for this response"
                onSourceClick={onSourceClick}
              />
            )}
          </div>
        ))
      )}
      {isLoading && messages.length > 0 && (
        <div className="flex justify-start max-w-2xl mr-auto">
          <div className="rounded-lg p-4 bg-cyber-dark/80 border border-cyber-green/40 text-white animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
              <span className="text-white/50 text-sm ml-1">Processing your query...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
