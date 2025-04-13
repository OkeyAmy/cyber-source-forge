import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chatTypes';
import { User, Bot, Copy, Check, ExternalLink, Shield, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
  isScrolling?: boolean;
  onReference?: (sourceNum: number) => void;
}

const MessageBubble = ({ message, isLatest = false, isScrolling = false, onReference }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const isUser = message.role === 'user';
  
  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);
  
  // Count how many sources are verified
  const verifiedCount = message.sources?.filter(source => source.verified).length || 0;
  const totalSources = message.sources?.length || 0;
  const hasVerifiedSources = verifiedCount > 0;
  
  // Copy message to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
    });
  };
  
  // Handle feedback
  const handleFeedback = (isPositive: boolean) => {
    if (isPositive) {
      setLiked(true);
      setDisliked(false);
      toast({
        title: "Feedback received",
        description: "Thank you for your positive feedback.",
      });
    } else {
      setLiked(false);
      setDisliked(true);
      toast({
        title: "Feedback received",
        description: "Thank you for your feedback. We'll work to improve.",
      });
    }
  };
  
  // Extract reference numbers from text
  const parseReferences = (content: string) => {
    // Replace [1], [2], etc. with styled references
    return content.replace(/\[(\d+)\]/g, (_, num) => {
      return `<span class="inline-flex items-center justify-center px-1.5 py-0.5 text-xs bg-cyber-green/10 text-cyber-green rounded border border-cyber-green/20 mx-0.5 hover:bg-cyber-green/20 cursor-pointer transition-colors" data-reference="${num}">[${num}]</span>`;
    });
  };

  // Format AI response content with better styling for markdown
  const formatAIContent = (content: string) => {
    let formattedContent = content;
    
    // Apply reference styling
    formattedContent = parseReferences(formattedContent);
    
    // Advanced formatting
    // Bold
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    // Italics
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em class="text-white/90 italic">$1</em>');
    // Code
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code class="bg-black/30 text-cyber-cyan px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');
    
    // Lists
    formattedContent = formattedContent.replace(/^\s*[-*]\s+(.*?)(?=\n|$)/gm, '<li class="flex items-baseline mb-1"><span class="inline-block w-1.5 h-1.5 rounded-full bg-cyber-green mr-2 mt-1.5 flex-shrink-0"></span><span>$1</span></li>');
    formattedContent = formattedContent.replace(/^\s*(\d+)\.\s+(.*?)(?=\n|$)/gm, '<li class="flex items-baseline mb-1"><span class="text-cyber-green font-medium mr-2 flex-shrink-0">$1.</span><span>$2</span></li>');
    
    // Wrap lists in ul/ol tags
    formattedContent = formattedContent.replace(/(<li.*?<\/li>\n)+/g, '<ul class="my-2 ml-1 space-y-1">$&</ul>');
    
    // Headlines
    formattedContent = formattedContent.replace(/^###\s+(.*?)(?=\n|$)/gm, '<h3 class="text-base font-semibold text-white mt-3 mb-2">$1</h3>');
    formattedContent = formattedContent.replace(/^##\s+(.*?)(?=\n|$)/gm, '<h2 class="text-lg font-semibold text-white mt-4 mb-2">$1</h2>');
    formattedContent = formattedContent.replace(/^#\s+(.*?)(?=\n|$)/gm, '<h1 class="text-xl font-bold text-white mt-4 mb-3 pb-1 border-b border-white/10">$1</h1>');
    
    // Add paragraph breaks
    formattedContent = formattedContent.replace(/\n\n/g, '<br/><br/>');
    // Add line breaks
    formattedContent = formattedContent.replace(/\n/g, '<br/>');
    
    return formattedContent;
  };
  
  return (
    <div
      className={cn(
        "flex animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for AI */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-black to-gray-800 border border-cyber-green/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,170,0.15)]">
            <Bot className="w-4 h-4 text-cyber-green" />
          </div>
        </div>
      )}
      
      {/* Message content */}
      <div
        className={cn(
          "relative group",
          isUser 
            ? "bg-transparent mr-10" 
            : "bg-transparent ml-0"
        )}
      >
        {/* User message content */}
        {isUser && (
          <div className={cn(
            "p-3.5 rounded-2xl bg-gradient-to-br from-cyber-cyan/20 to-blue-500/10 border border-cyber-cyan/30 shadow-md",
            "text-white text-sm break-words max-w-[85%] md:max-w-[75%] relative"
          )}>
            {message.content}

            {/* Action buttons for user message */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => copyToClipboard()} 
                className="p-1.5 rounded-full bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700/80 text-white/70 hover:text-white transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            
          </div>
        )}
        
        {/* AI message content */}
        {!isUser && (
          <div className={cn(
            "p-4 rounded-2xl bg-gradient-to-br from-cyber-green/10 to-cyber-cyan/5 border border-cyber-green/30 shadow-md",
            "text-white text-sm break-words max-w-[85%] md:max-w-[75%] relative"
          )}>
            {/* AI message with formatted content */}
            <div 
              className="assistant-content"
              dangerouslySetInnerHTML={{ __html: formatAIContent(message.content) }}
            />
            
            {/* Source indicator - small tag showing verified sources if available */}
            {totalSources > 0 && (
              <div className={cn(
                "mt-2 inline-flex items-center text-xs rounded-full px-2 py-0.5",
                hasVerifiedSources
                  ? "bg-cyber-green/10 text-cyber-green border border-cyber-green/30" 
                  : "bg-white/10 text-white/70 border border-white/20"
              )}>
                {hasVerifiedSources ? (
                  <>
                    <span className="mr-1 font-medium">{verifiedCount}/{totalSources}</span> 
                    <span>verified sources</span>
                  </>
                ) : (
                  <span>Unverified sources</span>
                )}
              </div>
            )}

            {/* Action buttons for AI message */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-2">
              <button 
                onClick={() => copyToClipboard()}
                className="p-1.5 rounded-full bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700/80 text-white/70 hover:text-white transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              {/* Feedback buttons - thumbs up/down */}
              <div className="flex flex-col space-y-1 mt-1">
                {/* Thumbs up */}
                <button
                  className={cn(
                    "p-1.5 rounded-full",
                    liked 
                      ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/30" 
                      : "bg-transparent hover:bg-white/5 text-white/50 hover:text-white/80"
                  )}
                  onClick={() => handleFeedback(true)}
                  aria-label="Helpful"
                  disabled={liked || disliked}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                
                {/* Thumbs down */}
                <button
                  className={cn(
                    "p-1.5 rounded-full",
                    disliked 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                      : "bg-transparent hover:bg-white/5 text-white/50 hover:text-white/80"
                  )}
                  onClick={() => handleFeedback(false)}
                  aria-label="Not helpful"
                  disabled={liked || disliked}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Avatar for User */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-black to-gray-800 border border-cyber-cyan/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,170,255,0.15)]">
            <User className="w-4 h-4 text-cyber-cyan" />
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;
