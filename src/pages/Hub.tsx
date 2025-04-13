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
import { LoadingState } from '@/components/LoadingState';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CyberSpinner } from '@/components/CyberSpinner';
import ModernChatInterface from '@/components/ModernChatInterface';

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
  
  // Ensure currentSource is set to "All Sources" after our UI changes
  useEffect(() => {
    setCurrentSource('All Sources');
  }, []);
  
  // Add logging for message rendering
  useEffect(() => {
    console.log("Messages updated:", localMessages);
    if (localMessages.length > 0) {
      localMessages.forEach((msg, idx) => {
        console.log(`Message ${idx} - Role: ${msg.role}, Content: ${msg.content.substring(0, 50)}...`);
      });
    }
  }, [localMessages]);
  
  // Enhanced addMessage function
  const addMessage = (message: ChatMessage) => {
    console.log("Adding message:", message.role, message.content.substring(0, 50));
    
    // Update local messages immediately for responsive UI
    setLocalMessages(prev => [...prev, message]);
    
    // Then update chat history
    if (currentChat) {
      const updatedMessages = [...(currentChat.messages || []), message];
      updateChatMessages(currentChat.id, updatedMessages);
    }
    
    // Force scroll to bottom on new message
    setTimeout(scrollToBottom, 100);
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
      
      console.log('API Response:', apiResponse);
      
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
      
      // Format content to handle reference notation
      let formattedContent = apiResponse.content;
      
      // Fix reference formatting if needed
      if (!formattedContent.match(/\[\d+\]/g)) {
        // If content doesn't have references in [n] format, try to add them
        apiResponse.sources.forEach((source, index) => {
          const refNum = source.num || (index + 1);
          if (formattedContent.includes(`(${refNum})`)) {
            formattedContent = formattedContent.replace(
              new RegExp(`\\(${refNum}\\)`, 'g'),
              `[${refNum}]`
            );
          }
        });
      }
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: formattedContent,
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
      
      // Ensure sources have proper IDs and preview data
      const processedSources = sources.map(source => ({
        ...source,
        num: source.num || Math.floor(Math.random() * 1000),
        preview: source.preview || source.snippet || "No preview available"
      }));
      
      setApiSources(processedSources);
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
        // Retry finding the source after fetching all sources
        const updatedSource = apiSources.find(s => s.num === num);
        if (updatedSource) {
          window.open(updatedSource.link, '_blank');
        } else {
          toast({
            title: "Source not found",
            description: `Source [${num}] could not be located.`,
            variant: "destructive"
          });
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#0d1117] text-white overflow-hidden">
      {/* Enhanced cyberpunk background with animated elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 255, 170, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 170, 0.2) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-cyber-green/10 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-cyber-cyan/10 blur-[100px]" />
          <div className="absolute top-[40%] right-[20%] w-40 h-40 rounded-full bg-[#ff00aa]/10 blur-[80px]" />
        </div>
      </div>

      {/* Modernized header with striking design */}
      <header className="border-b border-cyber-green/30 p-4 z-50 bg-black/50 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,255,170,0.15)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-3 md:hidden"
            />
            {/* Enhanced logo design */}
            <div className="flex items-center">
              <div className="w-12 h-12 relative mr-3">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-green to-cyber-cyan rounded-xl rotate-45 opacity-70 animate-pulse-slow"></div>
                <div className="absolute inset-0.5 bg-black rounded-[10px] flex items-center justify-center">
                  <Shield className="text-cyber-green w-6 h-6 drop-shadow-[0_0_5px_rgba(0,255,170,0.7)]" />
                </div>
          </div>
          <div>
                <h1 className="text-2xl font-extrabold tracking-tighter">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-cyan">SOURCE</span>
              <span className="text-white">FINDER</span>
            </h1>
                <p className="text-xs text-cyber-cyan font-light tracking-wider">VERIFYING TRUTH IN THE DIGITAL AGE</p>
              </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
            {/* Redesigned action buttons */}
          <Button
            variant="outline"
            size="sm"
              className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center gap-1 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            onClick={() => {
              createNewChat();
              setAllSources([]);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
              className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center gap-1 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            onClick={handleExportChat}
          >
            <Share className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
              className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            onClick={() => setSettingsOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Modernized sidebar */}
        <aside 
          className={`bg-black/80 backdrop-blur-lg border-r border-cyber-green/30 w-[320px] flex-shrink-0 transition-all duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative z-40 h-[calc(100%-4rem)] md:translate-x-0 shadow-[2px_0_15px_rgba(0,0,0,0.5)]`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-cyber-green/30 flex justify-between items-center bg-black/50">
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
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 opacity-30 text-cyber-cyan" />
                  </div>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-2 text-white/30">Start a conversation to see your chat history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`p-3 rounded-lg transition-all duration-200 cursor-pointer border ${
                        currentChat?.id === session.id 
                          ? 'bg-gradient-to-r from-cyber-green/20 to-transparent border-cyber-green/40' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => handleChatSessionClick(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium line-clamp-1">{session.title || "New Conversation"}</p>
                        <div className={`w-2 h-2 rounded-full ${currentChat?.id === session.id ? 'bg-cyber-green' : 'bg-white/20'}`} />
                      </div>
                      <p className="text-xs text-cyber-cyan mt-1">
                        {new Date(session.updated_at).toLocaleDateString()} · {session.messages.length} messages
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 border-t border-cyber-green/30 bg-black/50 flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-black/30 hover:bg-black/50 transition-all duration-300 group"
                onClick={() => {
                  createNewChat();
                  setAllSources([]);
                  setSidebarOpen(false);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                New Conversation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-white hover:text-[#ff00aa] border-white/20 hover:border-[#ff00aa]/40 bg-black/30 hover:bg-black/50 transition-all duration-300 group"
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
            className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main content with enhanced styles */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Sources tab will be handled by ModernChatInterface component */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ModernChatInterface
              messages={localMessages}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSendMessage={async () => {
                await handleSendMessage();
              }}
              allSources={allSources}
              isSourcesLoading={isApiSourcesLoading}
            />
          </div>
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
            /* Enhancing the overall theme */
            body {
              scrollbar-width: thin;
              scrollbar-color: rgba(0, 255, 170, 0.3) rgba(0, 0, 0, 0.2);
            }
            
            body::-webkit-scrollbar {
              width: 6px;
            }
            
            body::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 3px;
            }
            
            body::-webkit-scrollbar-thumb {
              background: rgba(0, 255, 170, 0.3);
              border-radius: 3px;
            }
            
            /* Fix for chat section background */
            .cs-main-container, 
            .cs-chat-container,
            .cs-message-list {
              background-color: transparent !important;
              background: transparent !important;
            }
            
            /* Ensure message list has the proper dark background */
            .cs-message-list {
              background: rgba(13, 17, 23, 0.9) !important;
              background-image: linear-gradient(to bottom, rgba(17, 24, 39, 0.9), rgba(13, 17, 23, 0.95)) !important;
              backdrop-filter: blur(4px) !important;
            }
            
            /* Add min-height to messages to ensure proper display */
            .cs-message {
              min-height: 40px !important; 
            }
            
            /* Make sure message list container has proper styling */
            .cs-chat-container .cs-message-list {
              background: rgba(13, 17, 23, 0.9) !important;
              background-image: linear-gradient(to bottom, rgba(17, 24, 39, 0.9), rgba(13, 17, 23, 0.95)) !important;
            }
            
            /* SourceFinder branding pulse animation */
            @keyframes pulse-slow {
              0%, 100% {
                opacity: 0.7;
              }
              50% {
                opacity: 0.9;
              }
            }
            
            .animate-pulse-slow {
              animation: pulse-slow 3s infinite ease-in-out;
            }
            
            /* Enhanced chat styling */
            .cs-message--outgoing .cs-message__content {
              background: linear-gradient(135deg, rgba(50, 50, 50, 0.8), rgba(30, 30, 30, 0.8)) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2) !important;
              backdrop-filter: blur(8px) !important;
              max-width: calc(100% - 48px) !important;
            }
            
            .cs-message--incoming .cs-message__content {
              background: linear-gradient(135deg, rgba(0, 20, 30, 0.8), rgba(0, 30, 40, 0.9)) !important;
              border: 1px solid rgba(0, 255, 170, 0.2) !important;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3) !important;
              backdrop-filter: blur(8px) !important;
              max-width: calc(100% - 48px) !important;
              color: white !important;
            }
            
            /* Fix text colors in messages - Force white text */
            .user-content, .user-content * {
              color: white !important;
            }
            
            .assistant-content, .assistant-content * {
              color: white !important;
            }
            
            .chat-message {
              color: white !important;
              text-shadow: 0 0 1px rgba(0, 0, 0, 0.5) !important;
            }
            
            /* Fix message content visibility */
            .cs-message__content {
              color: white !important;
            }
            
            .cs-message .cs-message__custom-content {
              color: white !important;
            }
            
            /* Style content more consistently */
            .cs-message__content {
              padding: 8px 12px !important;
            }
            
            /* Add some hover effect to chat messages for better interaction */
            .cs-message:hover .cs-message__content {
              box-shadow: 0 0 15px rgba(0, 255, 170, 0.15) !important;
            }
            
            /* Ensure all content within messages has proper styling */
            .cs-message *:not(button):not(a) {
              color: inherit !important;
            }
            
            /* Fix any background issues with the message content */
            .cs-message-list__scroll-wrapper {
              background: transparent !important;
            }
            
            /* Fix for message avatar backgrounds */
            .cs-avatar {
              background: transparent !important;
            }
            
            /* Ensure avatar stays within the right area */
            .cs-message--outgoing .cs-message__avatar-container {
              margin-right: 8px !important;
            }
            
            .cs-message--incoming .cs-message__avatar-container {
              margin-left: 8px !important;
            }

            /* Input styling improvements */
            .cs-message-input {
              backdrop-filter: blur(10px) !important;
              background: transparent !important;
              border: none !important;
            }
            
            .cs-message-input__content-editor-wrapper {
              background: rgba(10, 10, 20, 0.6) !important;
              border: 1px solid rgba(0, 255, 170, 0.2) !important;
              border-radius: 20px !important;
            }
            
            .cs-message-input__content-editor {
              color: white !important;
            }
            
            .cs-button--send {
              background: linear-gradient(135deg, #00ffaa, #00aaff) !important;
              color: black !important;
              border-radius: 50% !important;
              width: 36px !important;
              height: 36px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              box-shadow: 0 0 10px rgba(0, 255, 170, 0.5) !important;
              transition: all 0.2s ease-in-out !important;
            }
            
            .cs-button--send:hover {
              transform: scale(1.05) !important;
              box-shadow: 0 0 15px rgba(0, 255, 170, 0.7) !important;
            }
            
            /* Message styling */
            .reference-link {
              color: #00ffaa !important;
              cursor: pointer;
              font-weight: bold;
              padding: 0 2px;
              border-radius: 3px;
              text-decoration: none;
              transition: all 0.2s;
              background: rgba(0, 255, 170, 0.1);
            }
                
            .reference-link:hover {
              background-color: rgba(0, 255, 170, 0.3);
              text-decoration: underline;
            }
                
            .markdown-content {
              line-height: 1.6;
              color: white !important;
            }
            
            .markdown-content * {
              color: white !important;
            }
                
            .markdown-content h1, .markdown-content h2, .markdown-content h3, 
            .markdown-content h4, .markdown-content h5, .markdown-content h6 {
              color: white !important;
              margin-top: 1em;
              margin-bottom: 0.5em;
              font-weight: 600;
              border-bottom: 1px solid rgba(0, 255, 170, 0.2);
              padding-bottom: 0.3em;
            }
                
            .markdown-content h1 { font-size: 1.5em; }
            .markdown-content h2 { font-size: 1.3em; }
            .markdown-content h3 { font-size: 1.15em; }
            .markdown-content p { 
              margin-bottom: 1em;
              color: white !important;
            }
                
            .markdown-content ul, .markdown-content ol {
              margin-left: 1.5em;
              margin-bottom: 1em;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 0.5em 1em 0.5em 2em;
            }
                
            .markdown-content li { 
              margin-bottom: 0.5em; 
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              padding-bottom: 0.5em;
              color: white !important;
            }
                
            .markdown-content li:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
                
            .markdown-content blockquote {
              border-left: 3px solid #00ffaa;
              padding: 1em;
              margin: 1em 0;
              background: rgba(0, 255, 170, 0.05);
              border-radius: 0 8px 8px 0;
              font-style: italic;
              color: rgba(255, 255, 255, 0.9) !important;
            }
                
            .markdown-content code {
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
              padding: 0.2em 0.4em;
              font-family: monospace;
              border: 1px solid rgba(0, 255, 170, 0.1);
              color: #00ffaa !important;
            }
                
            .markdown-content pre {
              background: rgba(0, 0, 0, 0.5);
              border-radius: 8px;
              padding: 1em;
              overflow-x: auto;
              margin-bottom: 1em;
              border: 1px solid rgba(0, 255, 170, 0.1);
            }
                
            .markdown-content pre code {
              background: none;
              padding: 0;
              border: none;
            }
            
            /* Enhanced chat message formatting */
            .chat-message {
              font-size: inherit;
              word-break: break-word;
            }
                
            .chat-message strong {
              color: #00ffaa !important;
              font-weight: 600;
            }
                
            .chat-message em {
              font-style: italic;
              color: rgba(255, 255, 255, 0.9) !important;
            }
                
            .message-paragraph-break {
              height: 0.8em;
            }
            
            /* Enhanced scrolling styles */
            [data-radix-scroll-area-viewport] {
              height: 100% !important;
              -ms-overflow-style: none !important;
              scrollbar-width: thin !important;
              scrollbar-color: rgba(0, 255, 170, 0.3) transparent !important;
              scroll-behavior: smooth !important;
              -webkit-overflow-scrolling: touch !important;
              overscroll-behavior: contain !important;
              touch-action: pan-y !important;
            }
                
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
            
            /* Animations */
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fade-in {
              animation: fadeIn 0.3s ease-out forwards;
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
                
            /* Fixed position for scroll buttons */
            .chat-scroll-buttons {
              position: fixed !important;
              right: 16px !important;
              bottom: 144px !important;
              z-index: 100 !important;
              pointer-events: auto !important;
              width: auto !important;
              height: auto !important;
              background: transparent !important;
            }
                
            /* Additional styling to ensure the buttons are always visible */
            .chat-scroll-buttons button {
              opacity: 0.8;
              transition: opacity 0.2s ease-in-out;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.5) !important;
              background: rgba(0, 255, 170, 0.6) !important;
              border: none !important;
            }
                
            .chat-scroll-buttons button:hover {
              opacity: 1;
              box-shadow: 0 0 20px rgba(0, 255, 170, 0.4) !important;
              background: rgba(0, 255, 170, 0.8) !important;
            }
                
            /* Fix any potential z-index issues with ChatScope components */
            .cs-main-container, .cs-chat-container {
              z-index: 1 !important;
            }
                
            /* Fix all message display issues */
            .cs-message__content-wrapper {
              max-width: 100% !important;
              width: 100% !important;
            }
                
            /* Make sure the content fills the container properly */
            .cs-message .cs-message__custom-content {
              width: 100% !important;
              max-width: 100% !important;
              overflow-wrap: break-word !important;
            }
                
            /* Force color for all message text */
            .cs-message-list__scroll-wrapper,
            .cs-message-list__scroll-wrapper *,
            .cs-message-list > div,
            .cs-message-list > div *,
            .cs-message .cs-message__content,
            .cs-message .cs-message__content *,
            .cs-message__custom-content,
            .cs-message__custom-content * {
              color: white !important;
            }
            
            /* Clear any problematic styles that might interfere with text display */
            .cs-message-list > div {
              color: white !important;
            }
                
            .cs-message-list .cs-message {
              margin-bottom: 12px !important;
            }
                
            /* Fix for the message content padding */
            .cs-message__custom-content > div {
              padding: 0 !important;
              color: white !important;
            }
                
            /* Ensure message content is properly spaced */
            .cs-message .cs-message__content {
              padding: 10px !important;
              color: white !important;
            }
                
            /* Make sure text is visible with proper contrast */
            .user-content, .assistant-content {
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
              letter-spacing: 0.01em !important;
              color: white !important;
            }

            /* Fix all assistant message issues */
            .assistant-message .cs-message__content,
            .assistant-message .cs-message__content *,
            .assistant-message .assistant-content,
            .assistant-message .assistant-content * {
              color: white !important;
              font-weight: normal;
            }
        `}
      </style>
    </div>
  );
};

export default Hub;
