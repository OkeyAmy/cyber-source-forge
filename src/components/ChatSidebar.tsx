import React from 'react';
import { Clock, ChevronRight, PlusCircle, LogOut, MessageSquare, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { ChatSession } from '@/types/chatTypes';

interface ChatSidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onChatSessionClick: (sessionId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

function ChatSidebar({
  chatSessions,
  currentChatId,
  onChatSessionClick,
  onNewChat,
  onLogout,
  isOpen,
  onClose,
  className
}: ChatSidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-cyber-dark/95 border-r border-cyber-green/30 w-[300px] flex-shrink-0 transition-all duration-300 transform",
          isOpen ? 'translate-x-0' : '-translate-x-full',
          "absolute md:relative z-40 h-[calc(100%-4rem)] md:translate-x-0 shadow-[2px_0_10px_rgba(0,0,0,0.3)]",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-cyber-green/30 flex justify-between items-center bg-cyber-dark/50">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-4 w-4 mr-2 text-cyber-green" />
              Chat History
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/50 hover:text-cyber-green hover:bg-transparent md:hidden"
              onClick={onClose}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {chatSessions.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No messages yet</p>
                <p className="text-xs mt-2">Start a conversation to see your chat history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={cn(
                      "p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/5",
                      currentChatId === session.id ? 'bg-cyber-green/10 border-cyber-green/30' : 'bg-white/5'
                    )}
                    onClick={() => onChatSessionClick(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium line-clamp-1">{session.title || "New Conversation"}</p>
                      <Star className={cn(
                        "h-3 w-3", 
                        currentChatId === session.id 
                          ? "text-cyber-green" 
                          : "text-cyber-green/70 opacity-0 group-hover:opacity-100"
                      )} />
                    </div>
                    <p className="text-xs text-cyber-cyan mt-1">
                      {new Date(session.updated_at).toLocaleDateString()} · {session.messages.length} messages
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t border-cyber-green/30 bg-cyber-dark/50 flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all duration-300 group"
              onClick={() => {
                onNewChat();
                onClose(); // Close sidebar on mobile after creating new chat
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              New Conversation
            </Button>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-white hover:text-cyber-magenta border-white/20 hover:border-cyber-magenta/40 bg-transparent transition-all duration-300 group"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile overlay when sidebar is open */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default ChatSidebar; 