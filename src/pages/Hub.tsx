
import React, { useState, useEffect } from 'react';
import { 
  Book, History, User, LogOut, PlusCircle, Trash2, Download, 
  AlertTriangle, Search, Settings, ChevronLeft, ChevronRight, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { SourceType } from '@/components/SourceCard';
import HorizontalSourceScroller from '@/components/HorizontalSourceScroller';
import FocusAreaSelector from '@/components/FocusAreaSelector';
import { api } from '@/services/api';
import ErrorBoundary from '@/components/ErrorBoundary';
import ChatInput from '@/components/ChatInput';
import ChatMessages from '@/components/ChatMessages';

type FocusArea = 'All' | 'Research' | 'Social';

const Hub = () => {
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
  const [apiError, setApiError] = useState<Error | null>(null);
  
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
  
  const handleApiError = (error: any, customMessage: string) => {
    console.error(customMessage, error);
    setApiError(error instanceof Error ? error : new Error(customMessage));
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : customMessage,
      variant: "destructive",
    });
  };
  
  const loadSourcesForCurrentChat = async (chatId: string) => {
    try {
      if (!chatId) return;
      setApiError(null);
      const sources = await api.getSources(chatId);
      setActiveSources(sources || []);
    } catch (error) {
      handleApiError(error, "Failed to load sources for this chat");
    }
  };
  
  const checkForCurrentSession = async () => {
    try {
      setApiError(null);
      const currentSession = await api.getCurrentSession();
      if (currentSession.session_id) {
        await loadChat(currentSession.session_id);
      }
    } catch (error) {
      handleApiError(error, "Error checking current session");
    }
  };
  
  const processInitialQuery = async (query: string) => {
    try {
      setIsLoading(true);
      setApiError(null);
      
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
          role: 'user', 
          content: query 
        },
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
      handleApiError(error, "Failed to process your query");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;
    
    let currentChatSession = currentChat;
    if (!currentChatSession) {
      try {
        setApiError(null);
        const newChat = await api.createChat(message, true);
        await refetchChatHistory();
        currentChatSession = newChat;
      } catch (error) {
        handleApiError(error, "Failed to create a new chat");
        return;
      }
    }
    
    const updatedMessages = [
      ...chatHistory,
      { role: 'user', content: message } as ChatMessage
    ];
    
    setChatHistory(updatedMessages);
    
    if (!isAnonymous && currentChatSession) {
      await updateChatMessages(currentChatSession.id, updatedMessages);
    }
    
    setIsLoading(true);
    
    try {
      setApiError(null);
      const response = await api.processQuery(
        message, 
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
      handleApiError(error, "Failed to process your query");
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
      setApiError(null);
      await signOut();
      navigate('/');
    } catch (error) {
      handleApiError(error, "Failed to log out");
    }
  };
  
  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const startNewChat = async () => {
    try {
      setApiError(null);
      const newChat = await api.createChat("", true);
      await refetchChatHistory();
      await loadChat(newChat.id);
      setChatHistory([]);
      resetAnonymousMode();
    } catch (error) {
      handleApiError(error, "Failed to start a new chat");
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      setApiError(null);
      await deleteChat(chatId);
    } catch (error) {
      handleApiError(error, "Failed to delete chat");
    }
  };

  const handleChatSelect = async (chatId: string) => {
    try {
      setApiError(null);
      await loadChat(chatId);
    } catch (error) {
      handleApiError(error, "Failed to load chat");
    }
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
      handleApiError(error, "Failed to export chat history");
    }
  };

  const clearChatHistory = async () => {
    try {
      setApiError(null);
      for (const chat of savedChats) {
        await deleteChat(chat.id);
      }
      
      toast({
        title: "Chat history cleared",
        description: "All chat history has been removed from the system.",
      });
      
      startNewChat();
    } catch (error) {
      handleApiError(error, "Failed to clear chat history");
    }
  };

  const handleSourceClick = (source: SourceType) => {
    if (source.link) {
      window.open(source.link, '_blank', 'noopener,noreferrer');
    }
  };

  const resetError = () => {
    setApiError(null);
  };

  // Welcome screen when no messages
  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 animate-fade-in">
      <div className="mb-6 p-5 rounded-full bg-cyber-dark/80 border border-cyber-green animate-pulse-neon shadow-[0_0_15px_rgba(0,255,157,0.4)]">
        <Search className="w-10 h-10 text-cyber-green" />
      </div>
      <h2 className="text-3xl font-bold cyber-text-gradient mb-3">Source Finder</h2>
      <p className="text-white/60 max-w-md mb-6">
        Your AI-powered research assistant with verified sources from across the web
      </p>
      
      <FocusAreaSelector 
        selected={focusArea}
        onChange={setFocusArea}
        className="mt-2 mb-6"
      />
      
      <div className="w-24 h-24 relative my-4">
        <div className="absolute inset-0 bg-cyber-green/20 rounded-full animate-ping"></div>
        <div className="absolute inset-3 bg-cyber-green/30 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
        <div className="absolute inset-6 bg-cyber-green/40 rounded-full animate-ping" style={{ animationDelay: '600ms' }}></div>
        <div className="absolute inset-9 flex items-center justify-center w-6 h-6 bg-cyber-green text-black rounded-full">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      
      <p className="text-white/40 text-sm mb-6">
        Start by typing your research query below
      </p>
      
      {isAnonymous && (
        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md max-w-md animate-fade-in">
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
  );

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative overflow-hidden">
      <CyberBackground />
      
      <main className="flex-grow w-full mx-auto" style={{ maxWidth: "1440px" }}>
        <div className="flex h-screen relative z-10">
          {/* Left Sidebar - Chat History */}
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
          
          {/* Main Chat Area */}
          <div className="flex-grow flex flex-col max-w-4xl mx-auto">
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green">
              <ErrorBoundary 
                fallbackMessage="There was an error connecting to the Source Finder API"
                onReset={resetError}
              >
                {apiError ? (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <div className="p-6 rounded-lg border border-red-300 bg-red-50/10 text-red-200 flex flex-col items-center text-center max-w-md">
                      <div className="relative w-16 h-16 mb-4">
                        <AlertTriangle className="h-16 w-16 text-red-500 animate-pulse" />
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                          <div className="h-5 w-5 bg-red-800 rounded-full"></div>
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold mb-3 cyber-text-gradient">API Connection Error</h2>
                      <p className="text-sm mb-4 border-l-2 border-red-500 pl-3 text-left">{apiError.message}</p>
                      <Button 
                        variant="outline"
                        className="bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                        onClick={resetError}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Connection
                      </Button>
                    </div>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col">
                    <div className="p-3 backdrop-blur sticky top-0 z-10 border-b border-white/10">
                      <FocusAreaSelector 
                        selected={focusArea}
                        onChange={setFocusArea}
                      />
                    </div>
                    <ChatMessages 
                      messages={chatHistory}
                      isLoading={isLoading}
                      onSourceClick={handleSourceClick}
                    />
                  </div>
                )}
              </ErrorBoundary>
            </div>
            
            <ChatInput 
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isAnonymous={isAnonymous}
              isDisabled={!!apiError}
            />
          </div>
          
          {/* Right Sidebar - Sources */}
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
                      <div 
                        key={`${source.link}-${index}`} 
                        className="cyber-card p-3 border border-white/10 hover:border-cyber-green/30 transition-all duration-300 cursor-pointer"
                        onClick={() => handleSourceClick(source)}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-xs py-0.5 px-2 rounded-full bg-white/10 text-white">
                            {source.source}
                          </span>
                          {source.verified !== false && (
                            <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-cyber-green/20 text-cyber-green">
                              Verified
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-sm font-medium text-white mb-1 line-clamp-2">{source.title}</h3>
                        
                        <a 
                          href={source.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-cyber-cyan hover:underline flex items-center mb-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate max-w-[180px]">{source.link}</span>
                        </a>
                        
                        {source.preview && (
                          <p className="text-xs text-white/70 line-clamp-3 mt-2 p-2 bg-black/20 rounded border border-white/5">
                            {source.preview}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-white/50">
                    <div className="mx-auto w-16 h-16 rounded-full bg-cyber-dark/80 flex items-center justify-center mb-3">
                      <Book className="w-8 h-8 text-white/30" />
                    </div>
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
      </main>
      
      <SettingsCenter open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Hub;
