
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, Send, Trash2, PlusCircle, X, 
  Menu, MessageSquare, Settings, AlertCircle, Shield,
  Download, Share
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useChatHistory } from '@/hooks/useChatHistory';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ScrollArea } from "@/components/ui/scroll-area";
import CyberBackground from '@/components/CyberBackground';
import FocusAreaSelector from '@/components/FocusAreaSelector';
import { SourceType } from '@/types/chatTypes';
import SourceCard from '@/components/SourceCard';
import SidebarTrigger from '@/components/SidebarTrigger';
import SettingsCenter from '@/components/SettingsCenter';
import HorizontalSourceScroller from '@/components/HorizontalSourceScroller';
import LoadingState from '@/components/LoadingState';
import { ChatMessage, ProcessQueryResponse } from '@/types/chatTypes';

const Hub: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get chat history from hook with safe fallbacks and type assertion
  const { 
    chatHistory = [], 
    addMessage = () => {}, 
    clearChatHistory = () => {},
    exportChatHistory = () => ""
  } = useChatHistory() as {
    chatHistory: ChatMessage[];
    addMessage: (message: ChatMessage) => void;
    clearChatHistory: () => void;
    exportChatHistory: () => string;
  };
  
  // Get user settings with safe fallbacks
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const userPreferences = settings?.search_preferences || { focusArea: 'Research', anonymousMode: false };
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing your query...');
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [allSources, setAllSources] = useState<SourceType[]>([]);
  const [focusArea, setFocusArea] = useState<string>(userPreferences?.focusArea || "All");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Check for a pending query in session storage (coming from landing page)
    const pendingQuery = sessionStorage.getItem('pendingQuery');
    if (pendingQuery) {
      setInputValue(pendingQuery);
      sessionStorage.removeItem('pendingQuery');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  // Update focusArea whenever user preferences change
  useEffect(() => {
    if (settings?.search_preferences?.focusArea) {
      setFocusArea(settings.search_preferences.focusArea);
    }
  }, [settings]);
  
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
    // Create a hidden download link
    const blob = new Blob([exportChatHistory()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
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
      // Determine sources based on focus area
      let sourcesList;
      switch (focusArea) {
        case "Research":
          sourcesList = ["News", "Academic", "Web"];
          break;
        case "Social":
          sourcesList = ["Reddit", "Twitter", "Web"];
          break;
        default: // "All"
          sourcesList = ["Reddit", "Twitter", "Web", "News", "Academic"];
      }
      
      // Simulate different loading states
      setTimeout(() => {
        setLoadingMessage('Searching for sources...');
        setLoadingPhase(1);
      }, 1000);
      
      setTimeout(() => {
        setLoadingMessage('Analyzing credibility...');
        setLoadingPhase(2);
      }, 2500);
      
      // API call to process query
      const response = await fetch('https://source-finder-hoic.onrender.com/api/process-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          filters: {
            Sources: sourcesList
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: ProcessQueryResponse = await response.json();
      
      // Update all sources list
      setAllSources(prevSources => {
        const newSources = [...prevSources];
        data.response.sources.forEach(source => {
          if (!newSources.some(s => s.link === source.link)) {
            newSources.push(source);
          }
        });
        return newSources;
      });
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response.content,
        sources: convertSources(data.response.sources)
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
  
  return (
    <div className="h-screen flex flex-col bg-cyber-dark text-white overflow-hidden">
      <CyberBackground />
      
      {/* Header */}
      <header className="border-b border-cyber-green/20 p-4 flex items-center justify-between bg-cyber-dark/80 backdrop-blur-md z-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-cyber-dark rounded-md border-2 border-cyber-green flex items-center justify-center mr-3">
            <Shield className="text-cyber-green w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyber-green">SOURCE<span className="text-white">FINDER</span></h1>
            <p className="text-xs text-cyber-cyan">v0.1.0</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent"
            onClick={handleExportChat}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
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
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white/50 hover:text-cyber-green hover:bg-transparent"
                  onClick={handleClearChat}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white/50 hover:text-cyber-green hover:bg-transparent md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-2">Start a conversation to see your chat history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatHistory.filter(msg => msg.role === 'user').map((msg, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        scrollToBottom();
                      }}
                    >
                      <p className="text-sm line-clamp-2">{msg.content}</p>
                      <p className="text-xs text-cyber-cyan mt-1">
                        {new Date().toLocaleDateString()}
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
                  clearChatHistory();
                  setAllSources([]);
                  navigate('/hub');
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
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
                  <TabsTrigger value="sources" className="data-[state=active]:bg-cyber-green/20">Verified Sources</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex items-center">
                <FocusAreaSelector 
                  selected={focusArea as 'Research' | 'Social' | 'All'}
                  onChange={setFocusArea as (area: 'Research' | 'Social' | 'All') => void}
                />
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
                          <div className="flex items-center gap-3">
                            <div className="animate-pulse">
                              <div className="w-6 h-6 bg-cyber-green/20 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-cyber-green rounded-full"></div>
                              </div>
                            </div>
                            <p className="text-sm text-white/70">{loadingMessage}</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            {loadingPhase >= 1 && (
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-cyber-green/40 rounded-full animate-pulse" style={{width: '60%'}}></div>
                              </div>
                            )}
                            {loadingPhase >= 2 && (
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-cyber-green/60 rounded-full animate-pulse" style={{width: '30%'}}></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="max-w-3xl mx-auto bg-red-500/20 border border-red-500/40 rounded-lg p-4 flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Error</p>
                          <p className="text-sm opacity-80">{error}</p>
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
                      placeholder="Ask a research question..."
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
                  
                  <div className="mt-2 text-xs text-white/50 flex justify-between">
                    <div>
                      Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/10 text-xs">Shift+Enter</kbd> for new line
                    </div>
                    <div>
                      {userPreferences?.anonymousMode ? 'Anonymous Mode On' : 'Anonymous Mode Off'}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sources" className="flex-1 overflow-hidden m-0 p-4 data-[state=inactive]:hidden">
              {allSources.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <AlertCircle className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg">No sources gathered yet</p>
                  <p className="text-sm mt-2">Start a conversation to collect verified sources</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSources.map((source, idx) => (
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
