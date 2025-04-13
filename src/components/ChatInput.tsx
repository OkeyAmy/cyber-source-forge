import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Image, Paperclip, Sparkles, X, Link } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

function ChatInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Ask about any topic for verified sources...",
  className,
  onSuggestionClick
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Example suggestions - these could be dynamically generated
  const suggestions = [
    "Explain quantum computing with verified sources",
    "Analyze recent climate change research",
    "Compare Web3 technologies with academic sources",
    "Summarize the latest AI breakthroughs"
  ];
  
  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to fit the content
      textareaRef.current.style.height = Math.min(Math.max(textareaRef.current.scrollHeight, 60), 200) + 'px';
    }
  }, [inputValue]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Hide suggestions when typing
    if (e.target.value.length > 0 && showSuggestions) {
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    setShowSuggestions(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      setInputValue(suggestion);
      // Focus textarea after selecting suggestion
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
    setShowSuggestions(false);
  };
  
  const toggleSuggestions = () => {
    setShowSuggestions(prev => !prev);
  };
  
  const characterLimit = 2000;
  const isNearLimit = inputValue.length > characterLimit * 0.8;
  const isAtLimit = inputValue.length >= characterLimit;
  
  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Suggestions panel that appears above the input */}
      {showSuggestions && (
        <div className="absolute bottom-full mb-2 w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-white/10 shadow-lg z-10 p-3 transition-all duration-300 animate-slide-up">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-white font-medium flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-cyber-cyan" />
              Suggested queries
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full hover:bg-white/10"
              onClick={() => setShowSuggestions(false)}
            >
              <X className="h-3.5 w-3.5 text-white/60" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="h-auto py-2 px-3 justify-start text-left text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg border border-white/5 transition-all"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className={cn(
        "relative border rounded-xl transition-all duration-300 backdrop-blur-md",
        isFocused 
          ? "bg-gradient-to-br from-gray-800/90 to-black/95 border-cyber-green/50 shadow-[0_0_15px_rgba(0,255,170,0.15)]" 
          : "bg-gray-900/50 border-white/20",
        isAtLimit && "border-red-500/50",
        inputValue.length > 0 && "bg-gradient-to-r from-gray-800/90 to-black/95"
      )}>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={characterLimit}
          aria-label="Message input"
          className="min-h-[60px] max-h-[200px] resize-none pr-16 border-0 bg-transparent focus:ring-0 text-white overflow-hidden py-4 px-4 text-sm"
          disabled={isLoading}
        />
        
        {/* Left action buttons */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white/40 hover:text-white hover:bg-white/10"
                  onClick={toggleSuggestions}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Show suggestions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white/40 hover:text-white hover:bg-white/10"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Add link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Right action buttons */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full", 
                    inputValue.trim() && !isLoading
                      ? "bg-cyber-green hover:bg-cyber-green/90 text-black shadow-[0_0_10px_rgba(0,255,170,0.2)]"
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white",
                    isAtLimit && "bg-red-500/70 hover:bg-red-500/60 text-white"
                  )}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isAtLimit}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      inputValue.trim() ? "transform -translate-x-px" : ""
                    )} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{isLoading ? "Processing..." : "Send message"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Footer area with additional info */}
      <div className="flex justify-between items-center mt-1.5 px-2">
        {/* Status indicators */}
        <div className="text-xs text-white/40 flex items-center space-x-1">
          {isLoading && (
            <span className="animate-pulse">Processing your request...</span>
          )}
        </div>
        
        {/* Character count */}
        <div className={cn(
          "text-xs",
          isNearLimit ? (isAtLimit ? "text-red-400" : "text-amber-400") : "text-white/40"
        )}>
          {inputValue.length > 0 ? `${inputValue.length}/${characterLimit} characters` : ""}
        </div>
      </div>
      
      {/* Additional keyboard shortcuts info - optional */}
      {isFocused && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[10px] text-white/40 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md whitespace-nowrap">
          Press Enter to send, Shift+Enter for new line
        </div>
      )}
      
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(5px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default ChatInput;