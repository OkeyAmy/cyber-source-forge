
import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
  isAnonymous?: boolean;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  isLoading, 
  isAnonymous = false,
  isDisabled = false
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isDisabled) return;
    
    await onSubmit(message);
    setMessage('');
  };

  return (
    <div className="p-4 border-t border-white/10 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Ask your research question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="cyber-input pl-4 pr-12 py-3 rounded-full focus:shadow-[0_0_15px_rgba(0,255,157,0.4)] transition-all duration-300"
              disabled={isLoading || isDisabled}
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 cyber-button rounded-full p-2 h-auto w-auto"
              disabled={isLoading || !message.trim() || isDisabled}
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {isAnonymous && (
            <div className="mt-2 text-xs text-yellow-500 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>Anonymous mode active - this chat won't be saved</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
