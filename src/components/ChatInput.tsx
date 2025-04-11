import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Image, Paperclip } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

function ChatInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Ask about any topic for verified sources...",
  className 
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };
  
  const characterLimit = 2000;
  const isNearLimit = inputValue.length > characterLimit * 0.8;
  const isAtLimit = inputValue.length >= characterLimit;
  
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "relative border rounded-xl transition-all duration-300 bg-cyber-dark/50 backdrop-blur-md",
        isFocused ? "border-cyber-green/50 shadow-[0_0_10px_rgba(0,255,170,0.1)]" : "border-cyber-green/30",
        isAtLimit && "border-red-500/50"
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
          className="min-h-[60px] max-h-[200px] resize-none pr-14 border-0 bg-transparent focus:ring-0 text-white overflow-hidden"
          disabled={isLoading}
        />
        
        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1">
          {!isLoading && inputValue.trim() === '' && (
            <div className="flex space-x-1 mr-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                      aria-label="Attach file"
                      tabIndex={0}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Attach file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {/* Send button with dynamic states */}
          <Button
            type="button"
            className={cn(
              "h-9 w-9 p-0 border-none transition-all duration-300 rounded-full",
              inputValue.trim() && !isLoading 
                ? "bg-cyber-green hover:bg-cyber-green/80 text-black shadow-[0_0_10px_rgba(0,255,170,0.3)]" 
                : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white",
              isAtLimit && "bg-red-500/70 hover:bg-red-500/60 text-white shadow-[0_0_10px_rgba(255,0,0,0.3)]"
            )}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isAtLimit}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className={cn(
                "h-4 w-4 transition-transform duration-300",
                inputValue.trim() ? "transform -translate-x-px" : ""
              )} />
            )}
          </Button>
        </div>
      </div>
      
      {/* Character count and limit indicators */}
      <div className="flex justify-between items-center mt-1 px-1">
        {/* Input suggestions - could be auto-complete or shortcut buttons */}
        <div className="text-xs text-white/40 flex items-center space-x-1">
          {isLoading && (
            <span className="italic">Processing your request...</span>
          )}
        </div>
        
        {/* Character count */}
        {inputValue.length > 0 && (
          <div className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            isNearLimit ? (isAtLimit ? "text-red-400" : "text-amber-400") : "text-white/60"
          )}>
            {inputValue.length}/{characterLimit}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInput; 