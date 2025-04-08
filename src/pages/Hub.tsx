import React, { useState, useEffect, useRef } from 'react';
import { Send, Book, History, User, LogOut, PlusCircle, Trash2, Download, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import CyberBackground from '@/components/CyberBackground';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SettingsCenter from '@/components/SettingsCenter';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from '@/contexts/AuthContext';
import { useChatHistory, ChatMessage } from '@/hooks/useChatHistory';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAnonymousMode } from '@/hooks/useAnonymousMode';
import LoadingState from '@/components/LoadingState';
import SidebarTrigger from '@/components/SidebarTrigger';
import SourceCard, { SourceType } from '@/components/SourceCard';
import HorizontalSourceScroller from '@/components/HorizontalSourceScroller';
import FocusAreaSelector from '@/components/FocusAreaSelector';
import { api } from '@/services/api';

type FocusArea = 'All' | 'Research' | 'Social';

const Hub = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceType[]>([]);
  const [focusArea, setFocusArea] = useState<FocusArea>('All');
  const [isSourcesPanelCollapsed, setIsSourcesPanelCollapsed] = useState(() => {
    return localStorage.getItem('sourcesPanelCollapsed') === 'true';
  });
  const [isHistorySidebarCollapsed, setIsHistorySidebarCollapsed] = useState(() => {
    return localStorage.getItem('historySidebarCollapsed') === 'true';
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { user, signOut } = useAuth();
  const { settings } = useUserSettings();
  const { 
    chatHistory: savedChats, 
    currentChat,
    createNewChat, 
    updateChatMessages, 
    deleteChat,
    loadChat,
    refetch: refetchChatHistory
  } = useChatHistory();

  const { isAnonymous, toggleAnonymousMode, resetAnonymousMode } = useAnonymousMode(currentChat?.id);
  
  useEffect(() => {
    localStorage.setItem('sourcesPanelCollapsed', String(isSourcesPanelCollapsed));
  }, [isSourcesPanelCollapsed]);

  useEffect(() => {
    localStorage.setItem('historySidebarCollapsed', String(isHistorySidebarCollapsed));
  }, [isHistorySidebarCollapsed]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  useEffect(() => {
    if (currentChat) {
      setChatHistory(currentChat.messages || []);
      loadSourcesForCurrentChat(currentChat.id);
    } else {
      setChatHistory([]);
      setActiveSources([]);
    }
  }, [currentChat]);
  
  useEffect(() => {
    const initialQuery = sessionStorage.getItem('pendingQuery');
    if (initialQuery) {
      processInitialQuery(initialQuery);
      sessionStorage.removeItem('pendingQuery');
    } else {
      checkForCurrentSession();
    }
  }, []);
  
  const loadSourcesForCurrentChat = async (chatId: string) => {
    try {
      if (!chatId) return;
      const sources = await api.getSources(chatId);
      setActiveSources(sources || []);
    } catch (error) {
      console.error('Failed to load sources for chat:', error);
      toast({
        title: "Error",
        description: "Failed to load sources for this chat.",
        variant: "destructive",
      });
    }
  };
  
  const checkForCurrentSession = async () => {
    try {
      const currentSession = await api.getCurrentSession();
      if (currentSession.session_id) {
        await loadChat(currentSession.session_id);
      }
    } catch (error) {
      console.error('Error checking current session:', error);
    }
  };
  
  const processInitialQuery = async (query: string) => {
    setMessage('');
    
    try {
      setIsLoading(true);
      
      const chatSession = await api.createChat(query);
      
      if (!chatSession || !chatSession.id) {
        throw new Error('Failed to create chat session');
      }
      
      await refetchChatHistory();
      
      await loadChat(chatSession.id);
      
      const response = await api.processQuery(query, focusArea, chatSession.id);
      
      setActiveSources(response.sources || []);
      
      const updatedMessages: ChatMessage[] = [
        ...chatHistory,
        { 
          role: 'assistant', 
          content: response.content,
          sources: response.sources
        }
      ];
      
      setChatHistory(updatedMessages);
      
      if (!isAnonymous) {
        await updateChatMessages(chatSession.id, updatedMessages);
      }
    } catch (error) {
      console.error('Error processing initial query:', error);
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    let currentChatSession = currentChat;
    if (!currentChatSession) {
      try {
        const newChat = await api.createChat(message, true);
        await refetchChatHistory();
        currentChatSession = newChat;
      } catch (error) {
        console.error('Error creating new chat:', error);
        toast({
          title: "Error",
          description: "Failed to create a new chat. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    const userMessage = message;
    setMessage('');
    
    const updatedMessages = [
      ...chatHistory,
      { role: 'user', content: userMessage } as ChatMessage
    ];
    
    setChatHistory(updatedMessages);
    
    if (!isAnonymous && currentChatSession) {
      await updateChatMessages(currentChatSession.id, updatedMessages);
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.processQuery(
        userMessage, 
        focusArea, 
        currentChatSession?.id
      );
      
      if (response.sources && response.sources.length > 0) {
        setActiveSources(prevSources => {
          const existingLinks = new Set(prevSources.map(s => s.link));
          const newSources = response.sources.filter(s => !existingLinks.has(s.link));
          return [...prevSources, ...newSources];
        });
      }
      
      const finalMessages = [
        ...updatedMessages,
        { 
          role: 'assistant', 
          content: response.content,
          sources: response.sources
        } as ChatMessage
      ];
      
      setChatHistory(finalMessages);
      
      if (!isAnonymous && currentChatSession) {
        await updateChatMessages(currentChatSession.id, finalMessages);
      }
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    toast({
      title: "Logging out",
      description: "Disconnecting from the AI system...",
    });
    
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const startNewChat = async () => {
    try {
      const newChat = await api.createChat("", true);
      await refetchChatHistory();
      await loadChat(newChat.id);
      setChatHistory([]);
      setMessage('');
      resetAnonymousMode();
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast({
        title: "Error",
        description: "Failed to start a new chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    await deleteChat(chatId);
  };

  const handleChatSelect = async (chatId: string) => {
    await loadChat(chatId);
  };

  const exportChatHistory = () => {
    try {
      const dataStr = JSON.stringify(savedChats, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'cyber-chat-history.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export successful",
        description: "Your chat history has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting chat history:', error);
      toast({
        title: "Export failed",
        description: "Failed to export chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearChatHistory = async () => {
    try {
      for (const chat of savedChats) {
        await deleteChat(chat.id);
      }
      
      toast({
        title: "Chat history cleared",
        description: "All chat history has been removed from the system.",
      });
      
      startNewChat();
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Operation failed",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSourceClick = (source: SourceType) => {
    if (source.link) {
      window.open(source.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative overflow-hidden">
      <CyberBackground />
      
      <div className="flex flex-grow relative z-10">
        <Collapsible 
          open={!isHistorySidebarCollapsed} 
          onOpenChange={(open) => setIsHistorySidebarCollapsed(!open)}
          className="fixed md:relative inset-y-0 left-0 transition-all duration-300 ease-in-out md:w-64 bg-cyber-dark border-r border-white/10 flex flex-col z-30 shadow-[0_0_15px_rgba(0,255,157,0.2)]"
          style={{
            transform: isHistorySidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
            width: isHistorySidebarCollapsed ? '0' : '16rem',
            opacity: isHistorySidebarCollapsed ? 0 : 1,
            visibility: isHistorySidebarCollapsed ? 'hidden' : 'visible',
            overflow: 'hidden'
          }}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <History className="text-cyber-green mr-2" />
              <h2 className="text-xl font-bold">Query History</h2>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:flex hidden hover:bg-cyber-green/10 transition-colors duration-300">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent forceMount className="flex-grow flex flex-col" 
            style={{ 
              display: isHistorySidebarCollapsed ? 'none' : 'flex',
              visibility: isHistorySidebarCollapsed ? 'hidden' : 'visible' 
            }}
          >
            <div className="p-2">
              <Button 
                variant="outline" 
                className="w-full mb-3 bg-cyber-green/10 hover:bg-cyber-green/20 text-cyber-green border-cyber-green/30"
                onClick={startNewChat}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center">
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={toggleAnonymousMode}
                    id="anonymous-mode"
                    className="data-[state=checked]:bg-[#00ff9d]"
                  />
                  <label
                    htmlFor="anonymous-mode"
                    className="ml-2 text-sm font-medium text-white/80 cursor-pointer"
                  >
                    Anonymous Mode
                  </label>
                </div>
              </div>
              
              {isAnonymous && (
                <div className="mb-3 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-white/70">
                    Anonymous mode is ON. Current chat will not be saved.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green p-2">
              {isLoading && savedChats.length === 0 ? (
                <LoadingState type="skeleton" count={5} />
              ) : (
                <>
                  {savedChats.map((chat) => (
                    <div 
                      key={chat.id} 
                      className={`mb-2 p-2 hover:bg-white/5 rounded cursor-pointer flex items-center justify-between transition-colors duration-200 ${currentChat?.id === chat.id ? 'bg-white/10 border-l-2 border-[#00ff9d]' : ''}`}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <p className="text-sm text-white/80 truncate">
                        {chat.title}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-50 hover:opacity-100 hover:bg-red-500/10 transition-all duration-200"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {savedChats.length === 0 && !isLoading && (
                    <div className="text-center p-4 text-white/50">
                      <p>No history yet</p>
                      <p className="text-xs mt-2">Your research queries will appear here</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10">
              <div className="flex flex-col space-y-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs hover:bg-white/5 hover:text-[#00ff9d] transition-colors duration-300"
                  onClick={exportChatHistory}
                >
                  <Download className="h-3 w-3 mr-2" />
                  Export Chat History
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors duration-300"
                  onClick={clearChatHistory}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear All Chat History
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-cyber-green flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-cyber-dark" />
                  </div>
                  <span className="text-sm">{settings?.display_name || 'Researcher'}</span>
                </div>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 transition-colors duration-200" onClick={openSettings}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 transition-colors duration-200" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <SidebarTrigger
          isCollapsed={isHistorySidebarCollapsed}
          onClick={() => setIsHistorySidebarCollapsed(!isHistorySidebarCollapsed)}
          position="left"
          className="md:block"
        />
        
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-cyber-green">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="mb-4 p-4 rounded-full bg-cyber-dark/80 border border-cyber-green animate-pulse-neon shadow-[0_0_15px_rgba(0,255,157,0.4)]">
                  <Search className="w-8 h-8 text-cyber-green" />
                </div>
                <h2 className="text-2xl font-bold cyber-text-gradient mb-2">Source Finder</h2>
                <p className="text-white/60 max-w-md mb-4">
                  Your AI-powered research assistant with verified sources
                </p>
                
                <FocusAreaSelector 
                  selected={focusArea}
                  onChange={setFocusArea}
                  className="mt-4"
                />
                
                <p className="text-white/40 text-sm">
                  Start by typing your research query below
                </p>
                
                {isAnonymous && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md max-w-md">
                    <div className="flex items-center mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      <h3 className="font-medium text-yellow-500">Anonymous Mode Active</h3>
                    </div>
                    <p className="text-sm text-white/70">
                      Your current session will not be saved to chat history. Toggle off anonymous mode in the sidebar to save your chats.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <FocusAreaSelector 
                  selected={focusArea}
                  onChange={setFocusArea}
                />
                
                {isLoading && chatHistory.length === 0 ? (
                  <LoadingState type="chat" count={3} />
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} className="space-y-2">
                      <div 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-3xl ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                      >
                        <div 
                          className={`rounded-lg p-4 ${
                            msg.role === 'user' 
                              ? 'bg-cyber-magenta/20 border border-cyber-magenta/40 text-white hover:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-shadow duration-300' 
                              : 'bg-cyber-dark border border-cyber-green/40 text-white hover:shadow-[0_0_10px_rgba(0,255,157,0.2)] transition-shadow duration-300'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.content}</div>
                        </div>
                      </div>
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <HorizontalSourceScroller
                          sources={msg.sources}
                          title="Sources for this response"
                          onSourceClick={handleSourceClick}
                        />
                      )}
                    </div>
                  ))
                )}
                {isLoading && chatHistory.length > 0 && (
                  <div className="flex justify-start max-w-3xl mr-auto">
                    <div className="rounded-lg p-4 bg-cyber-dark border border-cyber-green/40 text-white animate-pulse">
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
            )}
          </div>
          
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="relative w-full max-w-[80%] mx-auto">
                <Input
                  type="text"
                  placeholder="Ask your research question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="cyber-input px-4 py-3 rounded-full focus:shadow-[0_0_15px_rgba(0,255,157,0.4)] transition-all duration-300 text-center"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 cyber-button rounded-full p-2 h-auto w-auto"
                  disabled={isLoading || !message.trim()}
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
        
        <Collapsible
          open={!isSourcesPanelCollapsed}
          onOpenChange={(open) => setIsSourcesPanelCollapsed(!open)}
          className="fixed md:relative inset-y-0 right-0 transition-all duration-300 ease-in-out md:w-72 bg-cyber-dark border-l border-white/10 flex flex-col z-30 shadow-[0_0_15px_rgba(0,255,157,0.2)]"
          style={{
            transform: isSourcesPanelCollapsed ? 'translateX(100%)' : 'translateX(0)',
            width: isSourcesPanelCollapsed ? '0' : '18rem',
            opacity: isSourcesPanelCollapsed ? 0 : 1,
            visibility: isSourcesPanelCollapsed ? 'hidden' : 'visible',
            overflow: 'hidden'
          }}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <Book className="text-cyber-green mr-2" />
              <h2 className="text-xl font-bold">Verified Sources</h2>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:flex hidden hover:bg-cyber-green/10 transition-colors duration-300">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent forceMount className="flex-grow" 
            style={{ 
              display: isSourcesPanelCollapsed ? 'none' : 'block',
              visibility: isSourcesPanelCollapsed ? 'hidden' : 'visible' 
            }}
          >
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green p-4">
              {isLoading && activeSources.length === 0 ? (
                <LoadingState type="sources" count={3} />
              ) : activeSources.length > 0 ? (
                <div className="space-y-4">
                  {activeSources.map((source, index) => (
                    <SourceCard 
                      key={`${source.link}-${index}`} 
                      source={source}
                      showPreview={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-white/50">
                  <p>No sources yet</p>
                  <p className="text-xs mt-2">Sources will appear here when your research query is processed</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <SidebarTrigger
          isCollapsed={isSourcesPanelCollapsed}
          onClick={() => setIsSourcesPanelCollapsed(!isSourcesPanelCollapsed)}
          position="right"
          className="md:block"
        />
      </div>
      
      <SettingsCenter open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Hub;
