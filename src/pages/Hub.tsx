
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, MessageSquare, Share, User,
  Shield, ChevronRight, Send
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import CyberBackground from '@/components/CyberBackground';
import { SourceType, ChatMessage, ProcessQueryResponse } from '@/types/chatTypes';
import SourceCard from '@/components/SourceCard';
import SidebarTrigger from '@/components/SidebarTrigger';
import SettingsCenter from '@/components/SettingsCenter';
import HorizontalSourceScroller from '@/components/HorizontalSourceScroller';
import LoadingState from '@/components/LoadingState';
import { useChatHistory } from '@/hooks/useChatHistory';

const Hub: React.FC = () => {
  const navigate = useNavigate();
  
  // Create a temporary mock implementation that matches the expected interface
  const chatHistoryHook = useChatHistory();
  const { 
    chatHistory: chatSessions = [], 
    currentChat = null,
    isLoading: chatLoading = false,
    createNewChat = async () => null,
    updateChatMessages = async () => {},
    clearAllChatHistory = async () => {},
    exportChatData = async () => {}
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    scrollToBottom();
  }, [chatHistory]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  
  return (
    <div className="h-screen flex flex-col bg-cyber-dark text-white overflow-hidden">
      <CyberBackground />
      
      {/* Header */}
      <header className="border-b border-cyber-green/20 p-4 flex items-center justify-between bg-cyber-dark/80 backdrop-blur-md z-50">
        <div className="flex items-center">
          {/* Logo as specified in the design */}
          <div className="w-10 h-10 bg-cyber-dark rounded-md border-2 border-cyber-green flex items-center justify-center mr-3">
            <Shield className="text-cyber-green w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyber-green">SOURCE<span className="text-white">FINDER</span></h1>
            <p className="text-xs text-cyber-cyan">v0.1.0</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Share/Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent flex items-center gap-1"
            onClick={handleExportChat}
          >
            <Share className="h-4 w-4" />
            Export
          </Button>
          
          {/* User Settings Button */}
          <Button
            variant="outline"
            size="icon"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent"
            onClick={() => setSettingsOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-cyber-dark/90 border-r border-cyber-green/20 w-[300px] flex-shrink-0 transition-all duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } absolute md:relative z-40 h-[calc(100%-4rem)] md:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-cyber-green/20 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Chat History</h2>
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
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        // Load this chat session
                        if (session.id !== currentChat?.id) {
                          chatHistoryHook.loadChat(session.id);
                        }
                        scrollToBottom();
                      }}
                    >
                      <p className="text-sm line-clamp-2">{session.title || "Conversation"}</p>
                      <p className="text-xs text-cyber-cyan mt-1">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 border-t border-cyber-green/20">
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent"
                onClick={() => {
                  createNewChat();
                  setAllSources([]);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Tabs defaultValue="chat" className="flex flex-col flex-1">
            <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-green/20 bg-cyber-dark/60">
              <div className="flex items-center space-x-2">
                <SidebarTrigger
                  isOpen={sidebarOpen}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                />
                <TabsList className="bg-cyber-dark/50">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-cyber-green/20">Chat</TabsTrigger>
                  <TabsTrigger value="sources" className="data-[state=active]:bg-cyber-green/20">{currentSource}</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent ${currentSource === 'Reddit' ? 'border-cyber-green text-cyber-green' : ''}`}
                  onClick={() => handleSourceChange('Reddit')}
                >
                  Reddit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent ${currentSource === 'Academic' ? 'border-cyber-green text-cyber-green' : ''}`}
                  onClick={() => handleSourceChange('Academic')}
                >
                  Academic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent ${currentSource === 'All Sources' ? 'border-cyber-green text-cyber-green' : ''}`}
                  onClick={() => handleSourceChange('All Sources')}
                >
                  All Sources
                </Button>
              </div>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0 data-[state=inactive]:hidden">
              {/* Messages area */}
              <ScrollArea className="flex-1 p-4">
                {chatHistory.length === 0 && !isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40 max-w-md mx-auto text-center p-4">
                    <div className="w-16 h-16 border-2 border-cyber-green/30 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-cyber-green/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white/70">Welcome to Source Finder</h3>
                    <p className="mb-6">
                      Ask any research question and I'll find verified sources with accurate information
                    </p>
                    <div className="grid grid-cols-1 gap-2 w-full">
                      {["Tell me about recent advancements in AI", "What are the environmental impacts of blockchain?", "Explain the latest research on quantum computing"].map((suggestion, idx) => (
                        <Button 
                          key={idx}
                          variant="outline" 
                          className="text-left justify-start h-auto py-3 border-white/10 hover:border-cyber-green/40 bg-white/5"
                          onClick={() => {
                            setInputValue(suggestion);
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                            }
                          }}
                        >
                          <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0 text-cyber-green" />
                          <span className="line-clamp-1">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 min-h-full pb-4">
                    {chatHistory.map((message, idx) => (
                      <div key={idx} className={`max-w-3xl ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div 
                            className={`rounded-lg p-4 ${
                              message.role === 'user' 
                                ? 'bg-cyber-green/20 text-white' 
                                : 'bg-white/10 border border-white/10'
                            } max-w-[85%]`}
                          >
                            <div className="text-sm">{message.content}</div>
                          </div>
                        </div>
                        
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                          <div className="mt-2 ml-4">
                            <HorizontalSourceScroller 
                              sources={message.sources.map(source => ({
                                num: Math.floor(Math.random() * 1000),
                                title: source.title,
                                link: source.url,
                                source: source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic" || "Web",
                                preview: "Source preview would go here...",
                                verified: source.verified
                              }))} 
                              onSourceClick={handleSourceClick}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="max-w-3xl mr-auto">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <LoadingState message={loadingMessage} phase={loadingPhase} />
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Input area */}
              <div className="p-4 border-t border-cyber-green/20 bg-cyber-dark/60 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="What can I help with?"
                      className="min-h-[60px] border-cyber-green/30 bg-cyber-dark focus:border-cyber-green/50 resize-none pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-cyber-green/20 hover:bg-cyber-green/30 border border-cyber-green/40"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sources" className="flex-1 overflow-hidden m-0 p-4 data-[state=inactive]:hidden">
              {allSources.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg">No sources gathered yet</p>
                  <p className="text-sm mt-2">Start a conversation to collect verified sources</p>
                </div>
              ) : (
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
          className="md:hidden fixed inset-0 bg-black/70 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Hub;
