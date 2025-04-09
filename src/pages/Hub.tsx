
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, MessageSquare, Share, User, LogOut,
  Shield, ChevronRight, Send, Sparkles, Clock, Star, PlusCircle
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import CyberBackground from '@/components/CyberBackground';
import { SourceType, ChatMessage, ProcessQueryResponse, ChatSession } from '@/types/chatTypes';
import SourceCard from '@/components/SourceCard';
import SidebarTrigger from '@/components/SidebarTrigger';
import SettingsCenter from '@/components/SettingsCenter';
import HorizontalSourceScroller from '@/components/HorizontalSourceScroller';
import LoadingState from '@/components/LoadingState';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Hub: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Create a temporary mock implementation that matches the expected interface
  const chatHistoryHook = useChatHistory();
  const { 
    chatHistory: chatSessions = [], 
    currentChat = null,
    isLoading: chatLoading = false,
    createNewChat = async () => null,
    updateChatMessages = async () => {},
    clearAllChatHistory = async () => {},
    exportChatData = async () => {},
    loadChat = async () => null
  } = chatHistoryHook;
  
  // Convert sessions to messages for the current implementation
  const chatHistory: ChatMessage[] = currentChat?.messages || [];
  
  const addMessage = (message: ChatMessage) => {
    if (currentChat) {
      const updatedMessages = [...currentChat.messages, message];
      updateChatMessages(currentChat.id, updatedMessages);
    }
  };
  
  const clearChatHistory = () => {
    clearAllChatHistory();
  };
  
  const exportChatHistory = () => {
    exportChatData();
    return "Chat exported";
  };
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing your query...');
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [allSources, setAllSources] = useState<SourceType[]>([]);
  const [currentSource, setCurrentSource] = useState<'Reddit' | 'Academic' | 'All Sources'>('All Sources');
  const [expandedSources, setExpandedSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Check for a pending query in session storage (coming from landing page)
    const pendingQuery = sessionStorage.getItem('pendingQuery');
    if (pendingQuery) {
      setInputValue(pendingQuery);
      sessionStorage.removeItem('pendingQuery');
    }
    
    // Initialize a chat session if needed
    if (!currentChat && !chatLoading) {
      createNewChat();
    }
  }, [chatLoading]);

  useEffect(() => {
    // Scroll to bottom of messages when new messages arrive
    scrollToBottom();
  }, [chatHistory]);
  
  const scrollToBottom = () => {
    // Use a small timeout to ensure DOM is updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSendMessage();
      }
    }
  };
  
  // Convert sources from API format to chat message format
  const convertSources = (sources: SourceType[]) => {
    return sources.map(source => ({
      url: source.link,
      title: source.title,
      source: source.source,
      verified: source.verified
    }));
  };

  const handleExportChat = () => {
    exportChatHistory();
    
    toast({
      title: "Chat exported",
      description: "Your conversation has been downloaded as a text file."
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue
    };
    
    addMessage(userMessage);
    
    // Clear input and set loading state
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate different loading states
      setTimeout(() => {
        setLoadingMessage('Searching for sources...');
        setLoadingPhase(1);
      }, 1000);
      
      setTimeout(() => {
        setLoadingMessage('Analyzing credibility...');
        setLoadingPhase(2);
      }, 2500);
      
      // Mock API response based on the selected source
      let mockSources: SourceType[] = [];
      
      // Generate different sources based on the currently selected source type
      if (currentSource === 'Reddit' || currentSource === 'All Sources') {
        mockSources.push({
          num: 1,
          title: "Reddit discussion on the topic",
          link: "https://reddit.com",
          source: "Reddit",
          preview: "Users discussing the pros and cons of this topic...",
          verified: Math.random() > 0.5
        });
      }
      
      if (currentSource === 'Academic' || currentSource === 'All Sources') {
        mockSources.push({
          num: 2,
          title: "Academic paper on this subject",
          link: "https://example.edu/paper",
          source: "Academic",
          preview: "This peer-reviewed paper discusses relevant findings...",
          verified: true
        });
      }
      
      if (currentSource === 'All Sources') {
        mockSources.push({
          num: 3,
          title: "News article on related developments",
          link: "https://news.example.com",
          source: "News",
          preview: "Recent developments suggest that...",
          verified: true
        });
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResponse: ProcessQueryResponse = {
        response: {
          content: `Here's what I found about "${inputValue}". According to the sources, there are multiple perspectives on this topic...`,
          sources: mockSources
        }
      };
      
      // Update all sources list
      setAllSources(prevSources => {
        const newSources = [...prevSources];
        mockResponse.response.sources.forEach(source => {
          if (!newSources.some(s => s.link === source.link)) {
            newSources.push(source);
          }
        });
        return newSources;
      });
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: mockResponse.response.content,
        sources: convertSources(mockResponse.response.sources)
      };
      
      addMessage(assistantMessage);
      
    } catch (err) {
      console.error('Error processing query:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your query.",
        sources: []
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingPhase(0);
      setLoadingMessage('Processing your query...');
      scrollToBottom();
    }
  };
  
  const handleSourceClick = (source: SourceType) => {
    // Open the source URL in a new tab
    window.open(source.link, '_blank');
  };
  
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearChatHistory();
      setAllSources([]);
      toast({
        title: "Chat cleared",
        description: "All messages have been removed.",
      });
    }
  };
  
  const handleSourceChange = (source: 'Reddit' | 'Academic' | 'All Sources') => {
    setCurrentSource(source);
  };

  const toggleExpandedSources = () => {
    setExpandedSources(!expandedSources);
  };

  const handleChatSessionClick = (sessionId: string) => {
    if (sessionId !== currentChat?.id) {
      loadChat(sessionId);
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-cyber-dark text-white overflow-hidden">
      <CyberBackground />
      
      {/* Header */}
      <header className="border-b border-cyber-green/30 p-4 flex items-center justify-between bg-cyber-dark/90 backdrop-blur-md z-50 shadow-[0_2px_10px_rgba(0,255,170,0.1)]">
        <div className="flex items-center">
          {/* Logo as specified in the design */}
          <div className="w-10 h-10 bg-cyber-dark rounded-md border-2 border-cyber-green flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(0,255,170,0.3)]">
            <Shield className="text-cyber-green w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-cyber-green">SOURCE</span>
              <span className="text-white">FINDER</span>
            </h1>
            <p className="text-xs text-cyber-cyan">Verifying truth in the digital age</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Share/Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent flex items-center gap-1 transition-all duration-300"
            onClick={handleExportChat}
          >
            <Share className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          {/* User Settings Button */}
          <Button
            variant="outline"
            size="icon"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all duration-300"
            onClick={() => setSettingsOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-cyber-dark/95 border-r border-cyber-green/30 w-[300px] flex-shrink-0 transition-all duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } absolute md:relative z-40 h-[calc(100%-4rem)] md:translate-x-0 shadow-[2px_0_10px_rgba(0,0,0,0.3)]`}
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
                onClick={() => setSidebarOpen(false)}
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
                      className={`p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/5 ${
                        currentChat?.id === session.id ? 'bg-cyber-green/10 border-cyber-green/30' : 'bg-white/5'
                      }`}
                      onClick={() => handleChatSessionClick(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium line-clamp-1">{session.title || "New Conversation"}</p>
                        <Star className={`h-3 w-3 ${currentChat?.id === session.id ? 'text-cyber-green' : 'text-cyber-green/70 opacity-0 group-hover:opacity-100'} transition-opacity`} />
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
                  createNewChat();
                  setAllSources([]);
                  setSidebarOpen(false); // Close sidebar on mobile after creating new chat
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                New Conversation
              </Button>
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-cyber-magenta border-white/20 hover:border-cyber-magenta/40 bg-transparent transition-all duration-300 group"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                Log Out
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Tabs defaultValue="chat" className="flex flex-col flex-1">
            <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-green/30 bg-cyber-dark/80 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <SidebarTrigger
                  isOpen={sidebarOpen}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                />
                <TabsList className="bg-cyber-dark/70 border border-cyber-green/20">
                  <TabsTrigger 
                    value="chat" 
                    className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Chat</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sources" 
                    className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{currentSource}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all ${currentSource === 'Reddit' ? 'border-cyber-green text-cyber-green bg-cyber-green/10' : ''}`}
                  onClick={() => handleSourceChange('Reddit')}
                >
                  Reddit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all ${currentSource === 'Academic' ? 'border-cyber-green text-cyber-green bg-cyber-green/10' : ''}`}
                  onClick={() => handleSourceChange('Academic')}
                >
                  Academic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all ${currentSource === 'All Sources' ? 'border-cyber-green text-cyber-green bg-cyber-green/10' : ''}`}
                  onClick={() => handleSourceChange('All Sources')}
                >
                  All Sources
                </Button>
              </div>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0 data-[state=inactive]:hidden">
              {/* Messages area - Improved scrolling container */}
              <ScrollArea 
                ref={scrollAreaRef} 
                className="flex-1 p-4 bg-gradient-to-b from-cyber-dark to-cyber-dark/90"
              >
                {chatHistory.length === 0 && !isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40 max-w-md mx-auto text-center p-4">
                    <div className="w-16 h-16 border-2 border-cyber-green/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,170,0.2)]">
                      <Shield className="h-8 w-8 text-cyber-green/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white/90">Welcome to Source Finder</h3>
                    <p className="mb-6 text-white/70">
                      Ask any research question and I'll find verified sources with accurate information
                    </p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                      {["Tell me about recent advancements in AI", "What are the environmental impacts of blockchain?", "Explain the latest research on quantum computing"].map((suggestion, idx) => (
                        <Button 
                          key={idx}
                          variant="outline" 
                          className="text-left justify-start h-auto py-3 border-white/10 hover:border-cyber-green/40 bg-white/5 hover:bg-white/10 transition-all group"
                          onClick={() => {
                            setInputValue(suggestion);
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                            }
                          }}
                        >
                          <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0 text-cyber-green group-hover:translate-x-1 transition-transform" />
                          <span className="line-clamp-1">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 min-h-full pb-4">
                    {chatHistory.map((message, idx) => (
                      <div key={idx} className={`max-w-3xl mx-auto animate-fade-in ${idx > 0 ? 'mt-8' : ''}`}>
                        <div className={cn(
                          "flex items-start mb-2",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}>
                          {message.role === 'assistant' && (
                            <div className="w-10 h-10 rounded-full border-2 border-cyber-green/40 flex items-center justify-center mr-3 bg-cyber-dark shadow-[0_0_10px_rgba(0,255,170,0.2)]">
                              <Shield className="h-5 w-5 text-cyber-green" />
                            </div>
                          )}
                          
                          <div className={cn(
                            "rounded-2xl p-4 max-w-[85%] shadow-lg",
                            message.role === 'user' 
                              ? "bg-cyber-green/20 backdrop-blur-sm border border-cyber-green/30 text-white ml-auto" 
                              : "bg-white/10 backdrop-blur-sm border border-white/10 text-white"
                          )}>
                            <div className={cn(
                              "text-sm leading-relaxed whitespace-pre-wrap",
                              message.role === 'user' ? "text-cyber-green" : "text-white"
                            )}>
                              {message.content}
                            </div>
                          </div>
                          
                          {message.role === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ml-3 border-2 border-white/20">
                              <User className="h-5 w-5 text-white/70" />
                            </div>
                          )}
                        </div>
                        
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                          <div className="pl-16 pr-4 mt-2 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs text-cyber-cyan flex items-center">
                                <Sparkles className="w-3 h-3 mr-1 text-cyber-green" />
                                <span>Sources ({message.sources.length})</span>
                              </h4>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs text-cyber-cyan p-0 h-auto"
                                onClick={toggleExpandedSources}
                              >
                                {expandedSources ? "Show less" : "View all"}
                              </Button>
                            </div>
                            
                            {expandedSources ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-fade-in">
                                {message.sources.map((source, sIdx) => (
                                  <div 
                                    key={sIdx}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,255,170,0.2)] ${
                                      source.verified ? 'border-cyber-green/30 bg-cyber-green/5' : 'border-cyber-magenta/30 bg-cyber-magenta/5'
                                    }`}
                                    onClick={() => window.open(source.url, '_blank')}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-xs py-0.5 px-2 rounded-full ${
                                        source.verified ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-magenta/20 text-cyber-magenta'
                                      }`}>
                                        {source.source || 'Web'}
                                      </span>
                                      {source.verified ? (
                                        <Shield className="h-3 w-3 text-cyber-green" />
                                      ) : (
                                        <Shield className="h-3 w-3 text-cyber-magenta" />
                                      )}
                                    </div>
                                    <h5 className="text-sm font-medium text-white/90 mb-1">{source.title}</h5>
                                    <a 
                                      href={source.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-cyber-cyan hover:underline block truncate"
                                      onClick={(e) => e.stopPropagation()}
                                    >{source.url}</a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <HorizontalSourceScroller 
                                sources={message.sources.map(source => ({
                                  num: Math.floor(Math.random() * 1000),
                                  title: source.title,
                                  link: source.url,
                                  source: source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic" || "Web",
                                  preview: "Preview of the source content...",
                                  verified: source.verified
                                }))} 
                                onSourceClick={handleSourceClick}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="max-w-3xl mx-auto pl-16 animate-fade-in">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm max-w-[85%]">
                          <LoadingState message={loadingMessage} phase={loadingPhase} />
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Input area */}
              <div className="p-4 border-t border-cyber-green/30 bg-cyber-dark/90 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about any topic for verified sources..."
                      className="min-h-[60px] border-cyber-green/30 bg-cyber-dark/50 focus:border-cyber-green/50 resize-none pr-12 shadow-[0_0_15px_rgba(0,0,0,0.2)] backdrop-blur-md"
                      disabled={isLoading}
                    />
                    <Button
                      className="absolute right-2 bottom-2 h-9 w-9 p-0 bg-cyber-green hover:bg-cyber-green/80 text-black border-none shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all duration-300"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs text-white/50">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white/50 hover:text-white p-0 h-auto"
                      onClick={handleClearChat}
                    >
                      Clear Chat
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sources" className="flex-1 overflow-hidden m-0 p-4 data-[state=inactive]:hidden bg-gradient-to-b from-cyber-dark to-cyber-dark/90">
              {allSources.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <Sparkles className="h-12 w-12 mb-4 opacity-30 text-cyber-green" />
                  <p className="text-lg">No sources gathered yet</p>
                  <p className="text-sm mt-2">Start a conversation to collect verified sources</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-cyber-green" />
                    {currentSource} ({allSources.filter(source => 
                      currentSource === 'All Sources' || 
                      source.source === currentSource
                    ).length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSources
                      .filter(source => 
                        currentSource === 'All Sources' || 
                        source.source === currentSource
                      )
                      .map((source, idx) => (
                      <SourceCard
                        key={idx}
                        source={source}
                        size="large"
                        showPreview={true}
                        onClick={handleSourceClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Settings Modal */}
      <SettingsCenter open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Hub;
