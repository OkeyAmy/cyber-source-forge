import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Menu, MessageSquare, Share, User, LogOut,
  Shield, ChevronRight, Send, Sparkles, Clock, Star, PlusCircle,
  X, ArrowLeft, ExternalLink, ChevronDown, Copy, Info, Zap, Loader2
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import CyberBackground from '@/components/CyberBackground';
import { SourceType, ChatMessage, ProcessQueryResponse, ChatSession, SourceReference } from '@/types/chatTypes';
import SourceCard from '@/components/SourceCard';
import SidebarTrigger from '@/components/SidebarTrigger';
import SettingsCenter from '@/components/SettingsCenter';
import HorizontalSourceScroller from '@/components/HorizontalSourceScroller';
import LoadingState from '@/components/LoadingState';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import ReferenceParser from '@/components/ReferenceParser';
import AllSourcesView from '@/components/AllSourcesView';
import { useScrollFix } from '@/hooks/useScrollFix';
import FilterControls, { SourceFilterType } from '@/components/FilterControls';

// Update the scrollAreaStyles to ensure proper scrolling behavior
const scrollAreaStyles: React.CSSProperties = {
  WebkitOverflowScrolling: 'touch',
  overflowY: 'auto',
  touchAction: 'pan-y',
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overscrollBehavior: 'contain',
  paddingBottom: '20px'
};

const Hub: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Use the enhanced scroll fix hook
  const { registerScrollContainer, scrollToBottom: scrollToBottomFixed, fixScrollingForElement } = useScrollFix();
  
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
  const [currentSource, setCurrentSource] = useState<SourceFilterType>('All Sources');
  const [expandedSources, setExpandedSources] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  
  // Add a new state to track when new sources are available
  const [hasNewSources, setHasNewSources] = useState(false);
  
  // Add available filters
  const availableFilters: SourceFilterType[] = ['All Sources', 'Reddit', 'Twitter', 'Web', 'News', 'Academic'];
  
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
    const initializeChat = async () => {
    if (!currentChat && !chatLoading) {
        // First check for any existing sessions
        try {
          const currentSession = await api.getCurrentSession();
          if (currentSession.session_id) {
            // If there's an existing session, load it
            await loadChat(currentSession.session_id);
          } else {
            // Otherwise create a new one
            await createNewChat();
          }
        } catch (err) {
          console.error("Error initializing chat:", err);
          await createNewChat();
        }
      }
    };
    
    initializeChat();
  }, [chatLoading, currentChat]);

  // Update the effect to use our fixed scrolling
  useEffect(() => {
    // Register the scroll container
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport && viewport instanceof HTMLElement) {
        registerScrollContainer(viewport);
      }
    }
  }, [registerScrollContainer]);

  // Add direct style fix for the scroll viewport when component mounts
  useEffect(() => {
    // Function to apply all required styles to make scrolling work properly
    const fixScrollStyles = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport && viewport instanceof HTMLElement) {
          fixScrollingForElement(viewport);
        }
      }
    };
    
    // Apply immediately and also after a short delay to ensure it works after initial render
    fixScrollStyles();
    const timer = setTimeout(fixScrollStyles, 500);
    
    return () => clearTimeout(timer);
  }, [fixScrollingForElement]);

  // Update the scrollToBottom function to use our improved implementation
  const scrollToBottom = () => {
    // Use our enhanced scroll to bottom function with smooth scrolling
    scrollToBottomFixed({ smooth: true });
  };

  // Ensure we scroll to bottom after messages change
  useEffect(() => {
    if (autoScroll) {
      // Use timeout to ensure the DOM is updated before scrolling
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [localMessages, autoScroll]);

  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport instanceof HTMLElement) {
          const { scrollTop, scrollHeight, clientHeight } = viewport;
          // Show button if not at bottom
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
          setShowScrollButton(!isAtBottom);
          
          // Auto-enable auto-scroll when user manually scrolls to bottom
          if (isAtBottom && !autoScroll) {
            setAutoScroll(true);
          } else if (!isAtBottom && autoScroll) {
            // Disable auto-scroll when user scrolls up
            setAutoScroll(false);
          }
        }
      }
    };

    // Add scroll event listener
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport instanceof HTMLElement) {
        viewport.addEventListener('scroll', handleScroll);
        return () => viewport.removeEventListener('scroll', handleScroll);
      }
    }
  }, [autoScroll]);

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
  const convertSources = (sources: SourceType[]): SourceReference[] => {
    return sources.map(source => ({
      num: source.num,
      title: source.title,
      link: source.link,
      source: source.source,
      preview: source.preview,
      images: source.images,
      logo: source.logo,
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
    
    // Create user message with unique ID
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    // Directly update the local messages state with the user message
    setLocalMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input and set loading state
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setAutoScroll(true);
    
    try {
      // Show loading indicators with faster transitions
      setTimeout(() => {
        setLoadingMessage('Searching for sources...');
        setLoadingPhase(1);
      }, 500);
      
      setTimeout(() => {
        setLoadingMessage('Analyzing credibility...');
        setLoadingPhase(2);
      }, 1500);
      
      // Get current session id
      const sessionId = currentChat?.id;
      
      // Determine which sources to use based on currentSource filter
      const focusArea = currentSource === 'All Sources' 
        ? 'All' 
        : currentSource === 'Academic' 
          ? 'Research' 
          : 'Social';
      
      // Call the API with proper parameters according to API documentation
      const apiResponse = await api.processQuery(inputValue, sessionId, focusArea);
      
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
      
      // Indicate new sources are available if we got any
      if (apiResponse.sources.length > 0) {
        setHasNewSources(true);
      }
      
      // Create assistant message with unique ID
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: apiResponse.content,
        sources: apiResponse.sources.map(s => ({
          num: s.num,
          title: s.title,
          link: s.link,
          source: s.source,
          preview: s.preview,
          images: s.images,
          logo: s.logo,
          verified: s.verified
        })),
        timestamp: new Date().toISOString()
      };
      
      // Directly update the local messages state with the assistant message
      setLocalMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Update chat history in Supabase through the API
      if (currentChat) {
        const allMessages = [...(currentChat.messages || [])];
        
        // Only add messages if they're not already in the array (check by ID or content)
        if (!allMessages.some(m => m.id === userMessage.id || (m.role === 'user' && m.content === userMessage.content))) {
          allMessages.push(userMessage);
        }
        
        if (!allMessages.some(m => m.id === assistantMessage.id)) {
          allMessages.push(assistantMessage);
        }
        
        // Save to remote persistence via API
        await updateChatMessages(currentChat.id, allMessages);
      }
      
    } catch (err) {
      console.error('Error processing query:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Show error toast
      toast({
        title: "Error processing query",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      
      // Create error message with unique ID
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your query.",
        sources: [],
        timestamp: new Date().toISOString()
      };
      
      // Directly update the local messages state with the error message
      setLocalMessages(prevMessages => [...prevMessages, errorMessage]);
      
      // Also update the chat history
      if (currentChat) {
        const allMessages = [...(currentChat.messages || [])];
        if (!allMessages.some(m => m.id === userMessage.id)) {
          allMessages.push(userMessage);
        }
        if (!allMessages.some(m => m.id === errorMessage.id)) {
          allMessages.push(errorMessage);
        }
        updateChatMessages(currentChat.id, allMessages);
      }
    } finally {
      setIsLoading(false);
      setLoadingPhase(0);
      setLoadingMessage('Processing your query...');
      
      // Ensure we scroll to bottom after everything is done
      setTimeout(() => {
        setAutoScroll(true);
        scrollToBottom();
      }, 200);
    }
  };
  
  const handleSourceClick = (source: SourceType) => {
    if (source.link) {
      window.open(source.link, "_blank", "noopener,noreferrer");
    }
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
  
  const handleSourceChange = (source: SourceFilterType) => {
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
  
  // Reset new sources flag when switching to sources tab
  useEffect(() => {
    if (activeTab === 'sources') {
      setHasNewSources(false);
    }
  }, [activeTab]);
  
  // Add a function to highlight the Sources tab when new sources are available
  const switchToSourcesTab = () => {
    setActiveTab('sources');
    setHasNewSources(false);
  };

  // Improve textarea auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Cap at 200px
      };
      
      textarea.addEventListener('input', adjustHeight);
      return () => textarea.removeEventListener('input', adjustHeight);
    }
  }, []);

  // Function to create well-structured, accessible message bubbles
  const renderMessage = (message: ChatMessage, idx: number) => {
    const isUser = message.role === 'user';
    const hasSourceRefs = message.content.includes('[') && message.content.includes(']');
    
    return (
      <div 
        key={message.id || idx}
        className={cn(
          "mb-6 group animate-fade-in",
          isUser ? "opacity-90" : "opacity-100" 
        )}
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        {/* Message header with role indicator */}
        <div className={cn(
          "flex items-center mb-2",
          isUser ? "justify-end" : "justify-start"
        )}>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
            isUser 
              ? "bg-white/5 text-white/70 border border-white/10" 
              : "bg-cyber-accent/10 text-cyber-accent/90 border border-cyber-accent/30"
          )}>
            <span>
              {isUser ? "You" : "AI Assistant"}
            </span>
          </div>
        </div>
        
        {/* Message content with enhanced styling */}
        <div className={cn(
          "rounded-lg p-4 max-w-[85%] md:max-w-[75%] text-sm break-words",
          isUser 
            ? "ml-auto bg-cyber-dark/80 border border-white/10 text-white/90" 
            : "bg-black/40 border border-cyber-accent/20 text-white/90"
        )}>
          {/* If message has source references, use the parser component */}
          {hasSourceRefs ? (
            <ReferenceParser 
              content={message.content} 
              sources={message.sources?.map(source => ({
                num: source.num,
                title: source.title,
                link: source.link,
                source: source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic",
                preview: source.preview,
                images: source.images,
                logo: source.logo,
                verified: source.verified
              })) || []} 
            />
          ) : (
            <div className="prose prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-a:text-cyber-accent prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Message source preview (if assistant and has sources) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-white/70">Sources Referenced</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs p-1 h-auto text-cyber-accent hover:text-cyber-accent hover:bg-cyber-accent/10"
                  onClick={switchToSourcesTab}
                >
                  View All
                </Button>
              </div>
              
              <HorizontalSourceScroller
                sources={message.sources?.map((source, idx) => ({
                  num: source.num || idx + 1,
                  title: source.title,
                  link: source.link || "",
                  source: source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic",
                  preview: source.preview || "",
                  logo: source.logo,
                })) || []}
                onSourceClick={handleSourceClick}
              />
            </div>
          )}
        </div>
        
        {/* Message actions */}
        <div className={cn(
          "mt-1 flex items-center gap-2 text-xs text-white/40",
          isUser ? "justify-end" : "justify-start" 
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:text-white hover:bg-white/5"
            onClick={() => copyMessageToClipboard(message.content)}
            aria-label="Copy message"
          >
            <Copy className="h-3 w-3 mr-1" />
            <span>Copy</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-cyber-dark text-white overflow-hidden">
      <CyberBackground />
      
      {/* Header - Enhanced blockchain design */}
      <header className="border-b border-cyber-green/40 bg-gradient-to-r from-cyber-dark via-cyber-dark/95 to-cyber-dark/90 backdrop-blur-md z-50 shadow-[0_0_15px_rgba(0,255,170,0.15)] relative overflow-hidden">
        {/* Animated circuit patterns */}
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <div className="circuit-patterns w-full h-full"></div>
        </div>
        
        {/* Hexagonal grid overlay */}
        <div className="absolute inset-0 bg-[url('/hexgrid.svg')] bg-repeat opacity-10"></div>
        
        <div className="relative p-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <SidebarTrigger
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-3 md:hidden"
            />
            {/* Enhanced logo with glow effect */}
            <div className="w-12 h-12 bg-black/40 rounded-lg border-2 border-cyber-green flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(0,255,170,0.4)] relative group">
              <div className="absolute inset-0 bg-cyber-green/10 rounded-md filter blur-md group-hover:blur-lg group-hover:bg-cyber-green/20 transition-all duration-500"></div>
              <Shield className="text-cyber-green w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
              <h1 className="text-2xl font-bold tracking-wider">
              <span className="text-cyber-green">SOURCE</span>
              <span className="text-white">FINDER</span>
                <span className="text-xs text-cyber-green/80 ml-1 align-top">v2.0</span>
            </h1>
              <p className="text-xs text-cyber-cyan tracking-wider">BLOCKCHAIN-SECURED INFORMATION VERIFICATION</p>
          </div>
        </div>
        
          <div className="flex items-center space-x-2">
            {/* New Chat Button - Enhanced design */}
          <Button
            variant="outline"
            size="sm"
              className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/70 bg-black/20 hover:bg-black/40 flex items-center gap-1 transition-all duration-300 rounded-md px-3 h-9 shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(0,255,170,0.2)]"
            onClick={() => {
              createNewChat();
              setAllSources([]);
            }}
          >
              <PlusCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline font-medium">New Chat</span>
          </Button>

            {/* Share/Export Button - Enhanced design */}
          <Button
            variant="outline"
            size="sm"
              className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/70 bg-black/20 hover:bg-black/40 flex items-center gap-1 transition-all duration-300 rounded-md px-3 h-9 shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(0,255,170,0.2)]"
            onClick={handleExportChat}
          >
              <Share className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline font-medium">Export</span>
          </Button>
          
            {/* User Settings Button - Enhanced design */}
          <Button
            variant="outline"
            size="icon"
              className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/70 bg-black/20 hover:bg-black/40 transition-all duration-300 rounded-md w-9 h-9 shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(0,255,170,0.2)]"
            onClick={() => setSettingsOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
          </div>
        </div>
        
        {/* Header bottom highlight line with animation */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-green to-transparent animate-pulse-slow"></div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Enhanced blockchain design */}
        <aside 
          className={`bg-gradient-to-b from-black/80 via-cyber-dark/95 to-cyber-dark/90 border-r border-cyber-green/30 w-[320px] flex-shrink-0 transition-all duration-500 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative z-40 h-[calc(100%-4rem)] md:translate-x-0 shadow-[2px_0_15px_rgba(0,0,0,0.4)] backdrop-blur-md`}
        >
          {/* Circuit line decoration */}
          <div className="absolute top-0 right-0 w-[1px] h-full bg-cyber-green/10 z-10"></div>
          <div className="absolute top-0 right-3 w-[1px] h-3/4 bg-cyber-green/5 z-10"></div>
          <div className="absolute top-0 right-6 w-[1px] h-1/2 bg-cyber-green/3 z-10"></div>
          
          {/* Hexagonal grid overlay */}
          <div className="absolute inset-0 bg-[url('/hexgrid.svg')] bg-repeat opacity-5"></div>
          
          <div className="flex flex-col h-full relative z-20">
            <div className="p-4 border-b border-cyber-green/20 flex justify-between items-center bg-gradient-to-r from-black/40 to-transparent relative">
              {/* Digital data stream effect */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="data-stream"></div>
              </div>
              
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Clock className="h-4 w-4 mr-2 text-cyber-green" />
                <span className="bg-gradient-to-r from-cyber-green to-cyber-cyan bg-clip-text text-transparent">CHAT HISTORY</span>
              </h2>
              <div className="flex gap-2 z-10">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:text-cyber-green hover:bg-cyber-green/10 border-transparent bg-black/30 rounded-md hover:shadow-[0_0_10px_rgba(0,255,170,0.2)]"
                  onClick={() => {
                    createNewChat();
                    setAllSources([]);
                  }}
                  aria-label="New chat"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 md:hidden rounded-md"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 px-3 py-3">
              {chatSessions.length === 0 ? (
                <div className="text-center py-8 text-white/40 relative">
                  {/* Empty state with improved visuals */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <div className="w-full h-full bg-[url('/blockchain-pattern.svg')] bg-center bg-no-repeat bg-contain"></div>
                  </div>
                  
                  <MessageSquare className="h-14 w-14 mx-auto mb-2 opacity-30 text-cyber-green" />
                  <p className="font-medium text-white/70 mb-1">No conversations yet</p>
                  <p className="text-xs mt-2 text-white/50 max-w-[220px] mx-auto leading-relaxed">
                    Start a new chat to begin finding verified blockchain-secured sources
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-5 border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10 bg-black/20 shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(0,255,170,0.2)]"
                    onClick={() => {
                      createNewChat();
                      setAllSources([]);
                      setSidebarOpen(false);
                    }}
                  >
                    <PlusCircle className="h-3 w-3 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 px-1">
                  {/* Enhanced chat session cards */}
                  {chatSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`p-3 rounded-lg transition-all cursor-pointer border relative overflow-hidden group ${
                        currentChat?.id === session.id 
                          ? 'bg-gradient-to-r from-cyber-green/15 to-black/40 border-cyber-green/40 shadow-[0_0_10px_rgba(0,255,170,0.15)]' 
                          : 'border-white/5 bg-black/20 hover:bg-black/30 hover:border-white/10'
                      }`}
                      onClick={() => handleChatSessionClick(session.id)}
                    >
                      {/* Active chat highlight effect */}
                      {currentChat?.id === session.id && (
                        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-cyber-green"></div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            currentChat?.id === session.id ? 'bg-cyber-green/20' : 'bg-black/30'
                          }`}>
                            <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${
                            currentChat?.id === session.id ? 'text-cyber-green' : 'text-white/60'
                          }`} />
                          </div>
                          <p className={`text-sm font-medium truncate ${
                            currentChat?.id === session.id ? 'text-cyber-green' : 'text-white/90'
                          }`}>
                            {session.title || "New Conversation"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyMessageToClipboard(session.title || "Conversation");
                            }}
                            aria-label="Copy title"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-cyber-cyan/80">
                          {new Date(session.updated_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-black/40 text-white/70 border border-white/5">
                            {session.messages.length} msgs
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 border-t border-cyber-green/20 bg-gradient-to-b from-transparent to-black/40 space-y-3 relative">
              {/* Bottom action buttons with enhanced design */}
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-black/30 hover:bg-black/50 transition-all duration-300 group shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(0,255,170,0.15)]"
                onClick={() => {
                  createNewChat();
                  setAllSources([]);
                  setSidebarOpen(false);
                }}
              >
                <div className="w-6 h-6 bg-black/50 border border-white/10 rounded-md flex items-center justify-center mr-2 group-hover:border-cyber-green/30">
                  <PlusCircle className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300 text-cyber-green" />
                </div>
                <span className="truncate">New Conversation</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-white/90 hover:bg-white/5 border-white/20 transition-all duration-300 bg-black/30 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                onClick={handleClearChat}
              >
                <div className="w-6 h-6 bg-black/50 border border-white/10 rounded-md flex items-center justify-center mr-2">
                  <X className="h-3.5 w-3.5 text-white/70" />
                </div>
                <span className="truncate">Clear All</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-cyber-magenta border-white/20 hover:border-cyber-magenta/40 bg-black/30 hover:bg-black/50 transition-all duration-300 group shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(255,0,170,0.15)]"
                onClick={handleLogout}
              >
                <div className="w-6 h-6 bg-black/50 border border-white/10 rounded-md flex items-center justify-center mr-2 group-hover:border-cyber-magenta/30">
                  <LogOut className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="truncate">Log Out</span>
              </Button>
              
              {/* Circuit line decoration at bottom */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent"></div>
            </div>
          </div>
        </aside>
        
        {/* Overlay for mobile sidebar with improved blur effect */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-md"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Enhanced tab design */}
          <Tabs defaultValue="chat" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-cyber-green/20 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-md relative">
              {/* Decorative blockchain lines */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="h-[1px] w-full bg-cyber-green/30 absolute top-[30%]"></div>
                <div className="h-[1px] w-[30%] bg-cyber-green/20 absolute bottom-[40%] left-0"></div>
                <div className="h-[1px] w-[20%] bg-cyber-green/20 absolute bottom-[40%] right-0"></div>
              </div>
              
              <TabsList className="h-12 p-1 w-full max-w-3xl mx-auto bg-transparent relative z-10">
                  <TabsTrigger 
                    value="chat" 
                  className="flex-1 data-[state=active]:bg-gradient-to-b data-[state=active]:from-cyber-green/30 data-[state=active]:to-cyber-green/5 data-[state=active]:text-cyber-green data-[state=active]:border-b data-[state=active]:border-cyber-green/70 rounded-none"
                  >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="relative">
                  Chat
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-green group-data-[state=active]:w-full transition-all duration-300"></span>
                  </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sources" 
                  className="flex-1 data-[state=active]:bg-gradient-to-b data-[state=active]:from-cyber-green/30 data-[state=active]:to-cyber-green/5 data-[state=active]:text-cyber-green data-[state=active]:border-b data-[state=active]:border-cyber-green/70 rounded-none relative"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="relative">
                  All Sources
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-green group-data-[state=active]:w-full transition-all duration-300"></span>
                  </span>
                  {hasNewSources && activeTab !== 'sources' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-cyan"></span>
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Enhanced Chat Interface */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Message List with enhanced scrolling */}
                <ScrollArea 
                  ref={scrollAreaRef} 
                  className="flex-1 p-4 bg-gradient-to-b from-cyber-dark via-black/80 to-cyber-dark/90"
                  data-testid="message-container"
                  style={scrollAreaStyles}
                  orientation="vertical"
                  scrollHideDelay={300}
                  isChatContainer={true}
                  viewportRef={scrollAreaRef}
                >
                  {/* Welcome Screen or Messages */}
                  {localMessages.length === 0 && !isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/40 max-w-md mx-auto text-center p-4">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 w-full h-full border-2 border-cyber-green/30 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-4 w-8 h-8 border border-cyber-green/80 rounded-full animate-pulse"></div>
                        <Shield className="h-6 w-6 absolute inset-0 m-auto text-cyber-green" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white/90 tracking-wide">Welcome to <span className="text-cyber-green">SOURCE</span>FINDER</h3>
                      <p className="mb-6 text-white/70">
                        Ask any research question and I'll find verified sources with accurate information
                      </p>
                      
                      {/* Blockchain-styled suggestion cards */}
                      <div className="grid grid-cols-1 gap-3 w-full">
                        {["Tell me about recent advancements in AI", "What are the environmental impacts of blockchain?", "Explain the latest research on quantum computing"].map((suggestion, idx) => (
                          <Button 
                            key={idx}
                            variant="outline" 
                            className="text-left justify-start h-auto py-3 border-cyber-green/20 hover:border-cyber-green/60 bg-black/40 hover:bg-black/60 group relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                            onClick={() => {
                              setInputValue(suggestion);
                              if (textareaRef.current) {
                                textareaRef.current.focus();
                              }
                            }}
                          >
                            {/* Decorative blockchain corner */}
                            <div className="absolute top-0 left-0 w-5 h-5 overflow-hidden opacity-80">
                              <div className="absolute transform rotate-45 bg-cyber-green/20 w-7 h-7 -top-3.5 -left-3.5"></div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-[50%] h-[2px] bg-gradient-to-l from-cyber-green/40 to-transparent"></div>
                            
                            <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0 text-cyber-green group-hover:translate-x-1 transition-transform" />
                            <span className="line-clamp-1 relative z-10">{suggestion}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end pb-24">
                      <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-end">
                        {/* Messages with improved contrast and readability */}
                        {localMessages.map((message, idx) => 
                          renderMessage(message, idx)
                        )}
                        
                        {/* Better loading indicator */}
                        {isLoading && (
                          <div className="flex items-center justify-center my-4 gap-2">
                            <div className="h-1 w-1 bg-cyber-accent rounded-full animate-pulse-slow delay-0"></div>
                            <div className="h-1 w-1 bg-cyber-accent rounded-full animate-pulse-slow delay-150"></div>
                            <div className="h-1 w-1 bg-cyber-accent rounded-full animate-pulse-slow delay-300"></div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} className="h-1" />
                              </div>
                    </div>
                  )}
                </ScrollArea>
                
                {/* Improved visual accessibility for the scroll button */}
                  {showScrollButton && (
                  <Button
                    onClick={scrollToBottom}
                    className="absolute bottom-24 right-6 rounded-full p-2.5 bg-cyber-accent/90 hover:bg-cyber-accent shadow-glow-sm animate-pulse-slow z-10 backdrop-blur-sm"
                    aria-label="Scroll to bottom"
                    >
                      <ChevronDown className="h-5 w-5" />
                  </Button>
                )}
                
                {/* Improved input area for better accessibility and visual hierarchy */}
                <div className="relative mt-auto p-4 border-t border-white/5 bg-black/40 backdrop-blur-sm">
                  <div className="relative max-w-3xl mx-auto">
                    {/* Input wrapper with enhanced visual feedback */}
                    <div className={cn(
                      "relative rounded-lg border overflow-hidden transition-all duration-300 shadow-inner",
                      "bg-black/80 backdrop-blur-md",
                      !isLoading 
                        ? "border-white/10 focus-within:border-cyber-accent/50 focus-within:shadow-glow-xs" 
                        : "border-cyber-accent/30 shadow-glow-xs"
                    )}>
                      {/* Textarea with improved accessibility */}
                      <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className={cn(
                          "resize-none min-h-[60px] p-4 pr-[100px] max-h-40 bg-transparent",
                          "border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                          "text-white/90 placeholder:text-white/40",
                          "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        )}
                        disabled={isLoading}
                        aria-label="Message input"
                        aria-disabled={isLoading}
                      />
                      
                      {/* Enhanced send button with loading state */}
                      <div className="absolute right-2 bottom-2 flex gap-2">
                        {!isLoading ? (
                      <Button
                            size="sm" 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                            className={cn(
                              "rounded-md px-4 h-9 transition-all duration-300",
                              "bg-gradient-to-r from-cyber-accent to-cyber-accent/80",
                              "hover:from-cyber-accent/90 hover:to-cyber-accent",
                              "text-black font-medium text-sm shadow-glow-xs",
                              "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                              "focus:ring-2 focus:ring-cyber-accent/20 focus:ring-offset-1 focus:ring-offset-black"
                            )}
                        aria-label="Send message"
                      >
                            <span className="mr-2">Send</span>
                        <Send className="h-4 w-4" />
                      </Button>
                        ) : (
                        <Button 
                          size="sm" 
                            disabled
                            className="rounded-md px-4 h-9 bg-cyber-accent/20 text-white/70"
                        >
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span>Processing...</span>
                        </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Helpful input hints for better UX */}
                    <div className="mt-2 flex justify-between items-center px-2 text-xs text-white/40">
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Press Enter to send, Shift+Enter for new line</span>
                      </div>
                      
                      {/* Character counter for feedback */}
                      <div className={cn(
                        "transition-colors",
                        inputValue.length > 1500 ? "text-cyber-magenta" : "text-white/40"
                      )}>
                        {inputValue.length}/2000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* All Sources Tab with improved filter controls */}
            <TabsContent value="sources" className="flex-1 p-4 overflow-y-auto bg-cyber-dark/90">
              <div className="max-w-6xl mx-auto mb-4">
                <h2 className="text-xl font-semibold text-white mb-4">Sources</h2>
                
                {/* Source Filter Controls */}
                <div className="mb-6">
                  <FilterControls 
                    availableFilters={availableFilters}
                    activeFilter={currentSource}
                    onFilterChange={handleSourceChange}
                    className="mb-2"
                  />
                  <p className="text-xs text-white/40 italic">
                    Filter sources by type to narrow down your research
                  </p>
                </div>
                
                {/* Sources Grid with improved source cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSources
                    .filter(source => currentSource === 'All Sources' || source.source === currentSource)
                    .map((source, idx) => (
                      <SourceCard
                        key={idx}
                        sourceIndex={source.num || idx + 1}
                        title={source.title}
                        link={source.link}
                        source={source.source}
                        preview={source.preview}
                        logo={source.logo}
                        onClick={() => handleSourceClick(source)}
                      />
                    ))
                  }
                </div>
                
                {/* Empty state */}
                {allSources.length === 0 && (
                  <div className="text-center py-12 text-white/40">
                    <p>No sources available yet. Ask a question to generate sources.</p>
                  </div>
                )}
                  </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Settings Modal */}
      <SettingsCenter open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Add CSS animations for blockchain elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Data flow animation */
        @keyframes dataFlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 100%; }
        }
        
        .data-flow-animation {
          background: linear-gradient(45deg, rgba(0,255,170,0.05) 25%, transparent 25%, transparent 50%, rgba(0,255,170,0.05) 50%, rgba(0,255,170,0.05) 75%, transparent 75%, transparent);
          background-size: 4px 4px;
          width: 100%;
          height: 100%;
          animation: dataFlow 20s linear infinite;
        }
        
        /* Pulse animation for glowing effects */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        /* Circuit pattern animation */
        @keyframes circuit {
          0% { opacity: 0.05; transform: translateY(0); }
          50% { opacity: 0.1; transform: translateY(-10px); }
          100% { opacity: 0.05; transform: translateY(0); }
        }
        
        .circuit-overlay {
          background: url('/circuit-pattern.svg');
          background-size: 100px 100px;
          width: 100%;
          height: 100%;
          animation: circuit 10s ease-in-out infinite;
        }
        
        /* Data stream animation */
        @keyframes dataStream {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        
        .data-stream {
          background: repeating-linear-gradient(
            0deg,
            rgba(0,255,170,0.1) 0px,
            rgba(0,255,170,0.1) 1px,
            transparent 1px,
            transparent 10px
          );
          width: 100%;
          height: 200%;
          animation: dataStream 20s linear infinite;
        }
        
        /* Circuit patterns animation */
        @keyframes circuitMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        .circuit-patterns {
          background: 
            radial-gradient(circle, rgba(0,255,170,0.1) 1px, transparent 1px) 0 0 / 20px 20px,
            radial-gradient(circle, rgba(0,255,170,0.05) 1px, transparent 1px) 10px 10px / 20px 20px;
          animation: circuitMove 30s linear infinite;
        }
        
        /* Fade in animation for elements */
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
      `}} />
    </div>
  );
};

export default Hub;
