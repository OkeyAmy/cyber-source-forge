import React, { useState } from 'react';
import { Clock, Search, PlusCircle, LogOut, MessageSquare, Trash2, X, ChevronDown, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { ChatSession } from '@/types/chatTypes';
import { format } from 'date-fns';

interface ChatSidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onChatSessionClick: (sessionId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  onDeleteChat?: (sessionId: string) => void;
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
  onDeleteChat,
  isOpen,
  onClose,
  className
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByDate, setGroupByDate] = useState(true);
  
  // Group chat sessions by date
  const groupedSessions = React.useMemo(() => {
    if (!groupByDate) return { "All Chats": chatSessions };
    
    return chatSessions.reduce((acc, session) => {
      const date = new Date(session.updated_at);
      let key = "Older";
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else if (date > new Date(today.setDate(today.getDate() - 7))) {
        key = "This Week";
      } else if (date > new Date(today.setDate(today.getDate() - 30))) {
        key = "This Month";
      }
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {} as Record<string, ChatSession[]>);
  }, [chatSessions, groupByDate]);
  
  // Filter sessions by search query
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedSessions;
    
    const query = searchQuery.toLowerCase();
    const result = {} as Record<string, ChatSession[]>;
    
    Object.entries(groupedSessions).forEach(([group, sessions]) => {
      const filtered = sessions.filter(session => 
        session.title?.toLowerCase().includes(query) || 
        session.messages.some(msg => msg.content.toLowerCase().includes(query))
      );
      
      if (filtered.length > 0) {
        result[group] = filtered;
      }
    });
    
    return result;
  }, [groupedSessions, searchQuery]);
  
  // Get date in formatted string
  const getFormattedDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  return (
    <>
      <aside 
        className={cn(
          "bg-gradient-to-b from-gray-900 to-black border-r border-white/10 w-80 flex-shrink-0 transition-all duration-300 transform",
          isOpen ? 'translate-x-0' : '-translate-x-full',
          "absolute md:relative z-40 h-screen md:translate-x-0 shadow-xl",
          className
        )}
        aria-label="Chat history"
      >
        <div className="flex flex-col h-full">
          {/* Modern header with refined design */}
          <div className="p-4 flex justify-between items-center border-b border-white/10 bg-gradient-to-r from-gray-900 to-black">
            <h2 className="text-base font-medium text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyber-green" />
              Chat History
            </h2>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10 md:hidden h-8 w-8 rounded-full transition-colors duration-200"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* New chat button with modern styling */}
          <div className="px-4 py-3 border-b border-white/10">
            <Button 
              variant="outline" 
              className="w-full bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 text-white hover:text-white justify-center transition-all duration-200 gap-2 h-10 rounded-lg shadow-sm"
              onClick={() => {
                onNewChat();
                onClose(); // Close sidebar on mobile
              }}
            >
              <PlusCircle className="h-4 w-4 text-cyber-green" />
              <span className="text-sm font-medium">New Conversation</span>
            </Button>
          </div>
          
          {/* Search with improved styling */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-sm h-9 focus-visible:ring-cyber-green/30 focus-visible:border-cyber-green/50 placeholder:text-white/40 rounded-lg"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1.5 top-1.5 h-6 w-6 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Chats list with improved visual design */}
          <ScrollArea className="flex-1 px-2 py-2 overflow-hidden">
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-white/20" />
                </div>
                <p className="text-sm text-white/50 font-medium">
                  {searchQuery ? 'No matching conversations found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {searchQuery ? 'Try different search terms' : 'Start a new conversation to get going'}
                </p>
                {searchQuery && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-3 text-cyber-green text-xs h-auto p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6 pt-2 pb-4">
                {Object.entries(filteredGroups).map(([group, sessions]) => (
                  <div key={group} className="space-y-1.5">
                    <div className="px-3 mb-2">
                      <div className="flex items-center">
                        <h3 className="text-xs font-medium text-white/50 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
                          {group}
                        </h3>
                        <span className="text-[11px] text-white/40 ml-2 bg-white/5 px-2 py-0.5 rounded-full">
                          {sessions.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {sessions.map((session) => (
                        <div 
                          key={session.id} 
                          className={cn(
                            "flex flex-col px-3 py-2 rounded-lg cursor-pointer group transition-all duration-200",
                            currentChatId === session.id 
                              ? "bg-gradient-to-r from-cyber-green/20 to-transparent border border-cyber-green/30" 
                              : "hover:bg-white/5 border border-transparent"
                          )}
                          onClick={() => {
                            onChatSessionClick(session.id);
                            onClose(); // Close sidebar on mobile
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                currentChatId === session.id ? "text-cyber-green" : "text-white/90"
                              )}>
                                {session.title || "Untitled Conversation"}
                              </h4>
                              
                              <p className="text-xs text-white/50 line-clamp-1 mt-0.5">
                                {session.messages[session.messages.length - 1]?.content.substring(0, 60) || "Empty chat"}
                              </p>
                            </div>
                            
                            {/* Show delete button on hover with improved styling */}
                            {onDeleteChat && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0 text-white/0 group-hover:text-white/40 hover:text-white/90 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 -mt-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteChat(session.id);
                                }}
                                aria-label="Delete chat"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-white/40">
                              {getFormattedDate(session.updated_at)}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {session.messages.length > 0 && (
                                <span className="text-[11px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                                  {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer with improved styling */}
          <div className="p-4 border-t border-white/10 bg-gradient-to-r from-gray-900 to-black">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/80 hover:text-cyber-green hover:bg-black/30 transition-all duration-200 text-sm h-10 gap-3 rounded-lg"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
              <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-70" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile overlay with improved blur effect */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default ChatSidebar;