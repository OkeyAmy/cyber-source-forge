import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, MessageSquare, Share, User, LogOut,
  Shield, ChevronRight, Send, Sparkles, Clock, Star, PlusCircle,
  X, ArrowLeft, ExternalLink, ChevronDown, Copy, Info, Database, Search, ArrowUpCircle
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
import { LoadingState } from '@/components/LoadingState';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CyberSpinner } from '@/components/CyberSpinner';

// Import ChatScope components
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  TypingIndicator,
  ConversationHeader
} from '@chatscope/chat-ui-kit-react';

// Import ChatScope styles directly
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

// Import the new blockchain theme instead of the old chat.css
import '@/styles/blockchain-theme.css';

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
  
  // Add local message state for better UI management
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  
  // Update local messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      setLocalMessages(currentChat.messages || []);
    } else {
      setLocalMessages([]);
    }
  }, [currentChat]);
  
  // Enhanced addMessage function
  const addMessage = (message: ChatMessage) => {
    // Update local messages immediately for responsive UI
    setLocalMessages(prev => [...prev, message]);
    
    // Then update chat history
    if (currentChat) {
      const updatedMessages = [...(currentChat.messages || []), message];
      updateChatMessages(currentChat.id, updatedMessages);
    }
  };
  
  const clearChatHistory = () => {
    clearAllChatHistory();
    setLocalMessages([]);
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
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [viewAllSourcesOpen, setViewAllSourcesOpen] = useState(false);
  const [apiSources, setApiSources] = useState<SourceType[]>([]);
  const [isApiSourcesLoading, setIsApiSourcesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  // Fetch sources when current chat changes
  useEffect(() => {
    if (currentChat?.id) {
      fetchAllSources(currentChat.id);
    }
  }, [currentChat?.id]);

  useEffect(() => {
    // Scroll to bottom of messages when new messages arrive
    scrollToBottom();
  }, [chatSessions]);

  // Scroll to bottom when new messages are added if autoScroll is enabled
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [localMessages, autoScroll]);
  
  // Update scroll behavior for ChatScope MessageList
  const scrollToBottom = () => {
    setTimeout(() => {
      try {
        const messageList = document.querySelector('.cs-message-list');
        if (messageList) {
          messageList.scrollTop = messageList.scrollHeight;
          setShowScrollButton(false);
        }
      } catch (e) {
        console.error('Error scrolling to bottom:', e);
      }
    }, 200); // Increased timeout to ensure content is fully rendered
  };
  
  // Handle scroll events for the MessageList with improved performance
  useEffect(() => {
    const handleScroll = debounce(() => {
      const messageList = document.querySelector('.cs-message-list');
      if (!messageList) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messageList;
      // Check if we're near the bottom with a reasonable threshold
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 150;
      
      setAutoScroll(isAtBottom);
      setShowScrollButton(!isAtBottom && scrollHeight > clientHeight + 200);
    }, 100);

    const messageList = document.querySelector('.cs-message-list');
    if (messageList) {
      messageList.addEventListener('scroll', handleScroll);
      
      return () => {
        messageList.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Improved debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return function(...args: any[]) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };
  
  // Adjustments for input handling with ChatScope
  const handleInputChange = (value: string) => {
    setInputValue(value);
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
      num: source.num,
      title: source.title,
      link: source.link,
      source: source.source,
      preview: source.preview || "No preview available",
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
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    // Add message locally immediately
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
      
      // Map our UI categories to API categories
      let apiSourceFilter: 'All' | 'Research' | 'Social' = 'All';
      
      if (currentSource === 'Academic') {
        apiSourceFilter = 'Research';
      } else if (currentSource === 'Reddit') {
        apiSourceFilter = 'Social';
      }
      
      // Call the API with the user's query
      const response = await api.processQuery(
        userMessage.content, 
        currentChat?.id, 
        apiSourceFilter
      );
      
      const apiResponse = {
        content: response.content,
        sources: response.sources
      };
      
      // Update all sources list
      setAllSources(prevSources => {
        const newSources = [...prevSources];
        apiResponse.sources.forEach(source => {
          if (!newSources.some(s => s.link === source.link)) {
            newSources.push(source);
          }
        });
        return newSources;
      });
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: apiResponse.content,
        sources: convertSources(apiResponse.sources),
        timestamp: new Date().toISOString()
      };
      
      addMessage(assistantMessage);
      
      // Fetch all sources to ensure references work
      fetchAllSources();
      
    } catch (err) {
      console.error('Error processing query:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your query.",
        sources: [],
        timestamp: new Date().toISOString()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingPhase(0);
      setLoadingMessage('Processing your query...');
      scrollToBottom();
    }
  };
  
  // Handle clicking on a source card
  const handleSourceClick = (source: SourceType) => {
    // Open the source URL in a new tab
    window.open(source.link, '_blank');
  };

  // Function to adapt SourceReference to SourceType for display
  const adaptSourceReferenceToSourceType = (source: any): SourceType => {
    return {
      num: source.num || Math.floor(Math.random() * 1000),
      title: source.title || 'Unknown Source',
      link: source.link || source.url || '#',
      source: (source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic") || "Web",
      preview: source.preview || "No preview available",
      images: source.images || [],
      logo: source.logo || null,
      verified: source.verified !== undefined ? source.verified : Math.random() > 0.25
    };
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

  // Copy message to clipboard
  const copyMessageToClipboard = (message: string) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
    });
  };
  
  // Function to fetch all sources for a session
  const fetchAllSources = async (sessionId?: string) => {
    try {
      setIsApiSourcesLoading(true);
      const sources = await api.getSources(sessionId || currentChat?.id);
      setApiSources(sources);
    } catch (error) {
      console.error("Error fetching sources:", error);
      toast({
        title: "Error",
        description: "Failed to load sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApiSourcesLoading(false);
    }
  };

  // Function to handle reference clicks in markdown
  const handleReferenceClick = (referenceId: string) => {
    // Extract the number from [1], [2], etc.
    const match = referenceId.match(/\[(\d+)\]/);
    if (!match || !match[1]) return;
    
    const num = parseInt(match[1], 10);
    const source = apiSources.find(s => s.num === num);
    
    if (source) {
      window.open(source.link, '_blank');
    } else {
      // If source not found in currently loaded sources, fetch all sources
      fetchAllSources().then(() => {
        const updatedSource = apiSources.find(s => s.num === num);
        if (updatedSource) {
          window.open(updatedSource.link, '_blank');
        }
      });
    }
  };
  
  // Parse markdown content to make reference links clickable
  const parseMarkdownReferences = (content: string) => {
    // Replace [1], [2], etc. with clickable spans
    return content.replace(/\[(\d+)\]/g, (match) => {
      return `<span class="reference-link" data-reference="${match}">${match}</span>`;
    });
  };
  
  // Custom renderer for markdown that handles reference links
  const MarkdownWithReferences = ({ content }: { content: string }) => {
    // Use a ref to store a reference to the container
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Add click handler for reference links
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('reference-link')) {
          const reference = target.getAttribute('data-reference');
          if (reference) {
            handleReferenceClick(reference);
          }
        }
      };
      
      container.addEventListener('click', handleClick);
      return () => container.removeEventListener('click', handleClick);
    }, [apiSources]);
    
    // Properly format markdown content with more chat-friendly styling
    const formattedContent = useMemo(() => {
      // First parse references
      const withReferences = parseMarkdownReferences(content);
      
      // Format content to be more chat-friendly
      return withReferences
        .replace(/\n\n/g, '<div class="message-paragraph-break"></div>') // Add spacing between paragraphs
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
        .replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code
    }, [content]);
    
    return (
      <div 
        ref={containerRef}
        className="markdown-content chat-message"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };
  
  // Load sources when switching to sources tab
  useEffect(() => {
    if (activeTab === 'sources' && apiSources.length === 0 && !isApiSourcesLoading) {
      fetchAllSources();
    }
  }, [activeTab]);
  
  return (
    <div className="h-screen flex flex-col bg-cyber-dark text-white overflow-hidden">
      <CyberBackground />
      
      {/* Header */}
      <header className="border-b border-cyber-green/30 p-4 flex items-center justify-between bg-cyber-dark/90 backdrop-blur-md z-50 shadow-[0_2px_10px_rgba(0,255,170,0.1)]">
        <div className="flex items-center">
          <SidebarTrigger
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 md:hidden"
          />
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
          {/* New Chat Button - Better positioned for conversational UI */}
          <Button
            variant="outline"
            size="sm"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent flex items-center gap-1 transition-all duration-300"
            onClick={() => {
              createNewChat();
              setAllSources([]);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>

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
        {/* Sidebar - Improved for mobile */}
        <aside 
          className={`bg-cyber-dark/95 border-r border-cyber-green/30 w-[300px] flex-shrink-0 transition-all duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative z-40 h-[calc(100%-4rem)] md:translate-x-0 shadow-[2px_0_10px_rgba(0,0,0,0.3)]`}
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
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 px-4 py-2">
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
                      className={`p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border ${
                        currentChat?.id === session.id ? 'bg-cyber-green/10 border-cyber-green/30' : 'border-white/5 bg-white/5'
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
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Tabs defaultValue="chat" className="flex flex-col flex-1" onValueChange={setActiveTab}>
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
              <div className="flex-1 h-full flex flex-col">
                <MainContainer className="bg-cyber-dark border-0 flex-1">
                  <ChatContainer>
                    <ConversationHeader>
                      <ConversationHeader.Content>
                        <div className="text-cyber-green text-sm">
                          {currentChat?.title || "New Conversation"}
                        </div>
                      </ConversationHeader.Content>
                      <ConversationHeader.Actions>
                        {showScrollButton && (
                          <div className="absolute bottom-28 right-4 z-50 animate-bounce-once">
                            <Button
                              onClick={() => {
                                const messageList = document.querySelector('.cs-message-list');
                                if (messageList) {
                                  setAutoScroll(true); // Enable auto-scroll when button is clicked
                                  messageList.scrollTop = messageList.scrollHeight;
                                }
                              }}
                              className="bg-cyber-green/90 text-black rounded-full p-3 shadow-lg shadow-cyber-green/20 hover:bg-cyber-green transition-colors duration-300 transform hover:scale-105 backdrop-blur-sm border border-cyber-green/30"
                              aria-label="Scroll to latest messages"
                              size="sm"
                            >
                              <ArrowUpCircle className="h-5 w-5 transform rotate-180" />
                            </Button>
                          </div>
                        )}
                      </ConversationHeader.Actions>
                    </ConversationHeader>

                    <MessageList
                      typingIndicator={isLoading ? (
                        <TypingIndicator content={
                          <div className="flex items-center space-x-3">
                            <div className="typing-indicator flex mb-1">
                              <span className="bg-cyber-green w-2 h-2 rounded-full mx-0.5"></span>
                              <span className="bg-cyber-green w-2 h-2 rounded-full mx-0.5"></span>
                              <span className="bg-cyber-green w-2 h-2 rounded-full mx-0.5"></span>
                            </div>
                            <div className="text-sm text-white/70">
                              <div className="bg-black/30 px-3 py-2 rounded border border-cyber-green/10">
                                <LoadingState message={loadingMessage} phase={loadingPhase} />
                              </div>
                            </div>
                          </div>
                        } />
                      ) : null}
                    >
                      {localMessages.length === 0 && !isLoading ? (
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
                          }}
                        >
                          <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0 text-cyber-green group-hover:translate-x-1 transition-transform" />
                          <span className="line-clamp-1">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                        <>
                          {localMessages.map((message, idx) => (
                            <Message
                              key={idx}
                              model={{
                                message: message.content,
                                sentTime: message.timestamp,
                                sender: message.role === 'user' ? 'You' : 'SourceFinder',
                                direction: message.role === 'user' ? 'outgoing' : 'incoming',
                                position: 'single'
                              }}
                              className="animate-fade-in"
                              style={{
                                animationDelay: `${idx * 0.05}s`,
                                animationDuration: "0.3s"
                              }}
                            >
                              <Avatar
                                name={message.role === 'user' ? 'You' : 'SourceFinder'}
                                className={message.role === 'user' ? 'cs-avatar--outgoing' : 'cs-avatar--incoming'}
                              >
                                {message.role === 'user' ? 
                                  <User className="h-4 w-4 text-white/70" /> : 
                                  <Shield className="h-4 w-4 text-cyber-green" />
                                }
                              </Avatar>
                              <Message.CustomContent>
                                <div className="text-sm leading-relaxed">
                                  {message.role === 'assistant' ? (
                                    <div 
                                      className="markdown-content chat-message"
                                      dangerouslySetInnerHTML={{ 
                                        __html: parseMarkdownReferences(message.content)
                                          .replace(/\n\n/g, '<div class="message-paragraph-break"></div>')
                                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          const container = el;
                                          
                                          const handleClick = (e: MouseEvent) => {
                                            const target = e.target as HTMLElement;
                                            if (target.classList.contains('reference-link')) {
                                              const reference = target.getAttribute('data-reference');
                                              if (reference) {
                                                handleReferenceClick(reference);
                                              }
                                            }
                                          };
                                          
                                          container.addEventListener('click', handleClick);
                                          // Cleanup is handled by React since the element is recreated each render
                                        }
                                      }}
                                    />
                                  ) : (
                                    message.content
                          )}
                        </div>
                                {message.timestamp && (
                                  <div className="text-[10px] text-white/40 mt-1 text-right">
                                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                )}
                              </Message.CustomContent>
                        
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                                <Message.Footer className="sources-display">
                                  <div className="flex items-center justify-between mb-1 w-full">
                              <h4 className="text-xs text-cyber-cyan flex items-center">
                                <Sparkles className="w-3 h-3 mr-1 text-cyber-green" />
                                <span>Sources ({message.sources.length})</span>
                              </h4>
                                    <div className="flex space-x-2">
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs text-cyber-cyan p-0 h-auto"
                                        onClick={() => {
                                          fetchAllSources();
                                          setViewAllSourcesOpen(true);
                                        }}
                              >
                                        <Database className="w-3 h-3 mr-1" />
                                        <span>All Sources</span>
                              </Button>
                            </div>
                                    </div>
                                  
                                  <div className="w-full">
                              <HorizontalSourceScroller 
                                      sources={message.sources?.map(adaptSourceReferenceToSourceType) || []} 
                                onSourceClick={handleSourceClick}
                                      onViewAllClick={() => {
                                        fetchAllSources();
                                        setViewAllSourcesOpen(true);
                                      }}
                              />
                          </div>
                                </Message.Footer>
                              )}
                            </Message>
                          ))}
                        </>
                      )}
                      <div ref={messagesEndRef} aria-hidden="true" className="h-px" />
                    </MessageList>
                    
                    <MessageInput
                      placeholder="Ask about any topic for verified sources..."
                      value={inputValue}
                      onChange={value => setInputValue(value)}
                      onSend={() => handleSendMessage()}
                      sendButton={true}
                      attachButton={false}
                      disabled={isLoading}
                      autoFocus
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderTop: '1px solid rgba(0, 255, 170, 0.15)'
                      }}
                    />
                  </ChatContainer>
                </MainContainer>
                
                <div className="p-2 bg-cyber-dark border-t border-cyber-green/30 flex justify-between items-center text-[10px] sm:text-xs text-white/50">
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
            </TabsContent>
            
            <TabsContent value="sources" className="flex-1 overflow-hidden m-0 p-4 data-[state=inactive]:hidden bg-gradient-to-b from-cyber-dark to-cyber-dark/90 relative">
              {/* Decorative grid background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full opacity-5" 
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(0, 255, 170, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 170, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
              </div>
              
              {isApiSourcesLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CyberSpinner text="Loading sources" />
                </div>
              ) : apiSources.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <Sparkles className="h-12 w-12 mb-4 opacity-30 text-cyber-green" />
                  <p className="text-lg">No sources gathered yet</p>
                  <p className="text-sm mt-2">Start a conversation to collect verified sources</p>
                  <Button
                    variant="outline"
                    className="mt-6 text-cyber-green border-cyber-green/30 hover:bg-cyber-green/10"
                    onClick={() => fetchAllSources()}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Fetch All Sources
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-cyber-green" />
                    {currentSource} ({apiSources.filter(source => 
                      currentSource === 'All Sources' || 
                      source.source === currentSource
                    ).length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apiSources
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
      
      {/* All Sources Dialog */}
      <Dialog 
        open={viewAllSourcesOpen} 
        onOpenChange={setViewAllSourcesOpen}
      >
        <DialogContent className="sm:max-w-[900px] bg-black/95 border border-cyber-green/20 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-white/10">
            <DialogTitle className="text-xl flex items-center">
              <Database className="w-5 h-5 mr-2 text-cyber-green" />
              All Sources
            </DialogTitle>
          </DialogHeader>
          
          <div className="all-sources-grid max-h-[70vh] overflow-y-auto p-6">
            {isApiSourcesLoading ? (
              <div className="col-span-full flex justify-center py-10">
                <CyberSpinner size="md" text="Loading sources..." />
              </div>
            ) : apiSources.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                <Database className="h-12 w-12 mb-2 opacity-30 text-cyber-green" />
                <p className="text-lg text-white/60">No sources collected yet</p>
                <p className="text-sm mt-1 text-white/40">Ask a question to start gathering verified sources</p>
              </div>
            ) : (
              apiSources.map((source, index) => (
                <div 
                  key={index}
                  className="source-card hover:shadow-md hover:shadow-cyber-green/5 cursor-pointer transition-all"
                  onClick={() => handleSourceClick(source)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className={`source-type source-type-${source.source.toLowerCase().replace(/\s+/g, '-')}`}>
                      {source.source}
                    </div>
                    {source.verified !== undefined && (
                      source.verified ? (
                        <div className="verified-badge text-[10px]">Verified</div>
                      ) : (
                        <div className="unverified-badge text-[10px]">Unverified</div>
                      )
                    )}
                  </div>
                  
                  <h3 className="source-card-title">{source.title}</h3>
                  <p className="source-card-snippet">{source.preview || "No preview available"}</p>
                  
                  <div className="source-card-footer">
                    <a 
                      href={source.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-cyber-green flex items-center hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Source
                    </a>
                    
                    <span className="text-xs text-white/40">Source #{source.num}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <style>
        {`
        .reference-link {
          color: #00ffaa;
          cursor: pointer;
          font-weight: bold;
          padding: 0 2px;
          border-radius: 3px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .reference-link:hover {
          background-color: rgba(0, 255, 170, 0.2);
          text-decoration: underline;
        }
        .markdown-content {
          line-height: 1.6;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, 
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          color: white;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.3em; }
        .markdown-content h3 { font-size: 1.15em; }
        .markdown-content p { margin-bottom: 1em; }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-content li { margin-bottom: 0.5em; }
        .markdown-content blockquote {
          border-left: 3px solid #00ffaa;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }
        .markdown-content code {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
          padding: 0.2em 0.4em;
          font-family: monospace;
        }
        .markdown-content pre {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
          padding: 1em;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        .markdown-content pre code {
          background: none;
          padding: 0;
        }
        
        /* Enhanced chat message formatting */
        .chat-message {
          font-size: inherit;
          word-break: break-word;
        }
        .chat-message strong {
          color: #00ffaa;
          font-weight: 600;
        }
        .chat-message em {
          font-style: italic;
          color: rgba(255, 255, 255, 0.9);
        }
        .message-paragraph-break {
          height: 0.5em;
        }
        
        /* Enhanced scrolling styles */
        [data-radix-scroll-area-viewport] {
          height: 100% !important;
          -ms-overflow-style: none !important; /* IE and Edge */
          scrollbar-width: thin !important; /* Firefox */
          scrollbar-color: rgba(0, 255, 170, 0.3) transparent !important;
          scroll-behavior: smooth !important;
          -webkit-overflow-scrolling: touch !important; /* iOS momentum scrolling */
          overscroll-behavior: contain !important; /* Prevent pull-to-refresh */
          touch-action: pan-y !important; /* Enable vertical scrolling on touch */
        }
        
        /* Custom scrollbar styling for browsers that support it */
        [data-radix-scroll-area-viewport]::-webkit-scrollbar {
          width: 6px !important;
        }
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2) !important;
          border-radius: 3px !important;
        }
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 170, 0.3) !important;
          border-radius: 3px !important;
        }
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 170, 0.5) !important;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10%); }
          50% { transform: translateY(0); }
        }
        
        /* Enhanced animations for chat messages */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Bounce once animation for scroll button */
        .animate-bounce-once {
          animation: bounceOnce 1s ease-out forwards;
        }
        @keyframes bounceOnce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        /* Typing indicator animation */
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        
        .typing-indicator span {
          animation: blink 1.4s infinite both;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        `}
      </style>
    </div>
  );
};

export default Hub;
