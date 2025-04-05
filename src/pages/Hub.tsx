
import React, { useState, useEffect, useRef } from 'react';
import { Send, Book, History, ChevronRight, ChevronLeft, Search, User, LogOut, BookmarkPlus, Settings, Link, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CyberBackground from '@/components/CyberBackground';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SettingsCenter from '@/components/SettingsCenter';

const Hub = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string; sources?: { url: string; title: string; }[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<{ url: string; title: string; verified: boolean }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Check if there's a query in session storage and process it
  useEffect(() => {
    const initialQuery = sessionStorage.getItem('pendingQuery');
    if (initialQuery) {
      processInitialQuery(initialQuery);
      sessionStorage.removeItem('pendingQuery');
    }
  }, []);
  
  const processInitialQuery = (query: string) => {
    setMessage('');
    setChatHistory([...chatHistory, { role: 'user', content: query }]);
    
    setIsLoading(true);
    
    // Simulate AI response with sources
    setTimeout(() => {
      const newSources = [
        { 
          url: 'https://example.com/research-paper-1', 
          title: 'Comprehensive Analysis of Neural Networks in Source Verification',
          verified: true 
        },
        { 
          url: 'https://example.com/blockchain-verification', 
          title: 'Blockchain-Based Verification Models for Academic Research',
          verified: true 
        },
        { 
          url: 'https://example.com/credibility-metrics', 
          title: 'Establishing Credibility Metrics in Digital Source Evaluation',
          verified: false 
        },
      ];
      
      setActiveSources(newSources);
      
      setChatHistory([
        ...chatHistory, 
        { 
          role: 'user', 
          content: query 
        },
        { 
          role: 'assistant', 
          content: `Based on verified sources, I can provide a comprehensive answer to your query "${query}".
          
          The integration of neural networks in source verification has shown significant improvements in accuracy rates, with an average increase of 27% compared to traditional methods. Blockchain-based verification adds an immutable layer of trust, particularly valuable for academic research where provenance is crucial.
          
          Current credibility metrics suggest implementing a multi-factorial approach that weighs source reputation, citation frequency, and verification status using a distributed ledger system.`,
          sources: newSources
        }
      ]);
      
      setIsLoading(false);
    }, 2000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage('');
    setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);
    
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const newSources = [
        { 
          url: 'https://example.com/advanced-algorithms', 
          title: 'Advanced Algorithms in Source Verification Systems',
          verified: true 
        },
        { 
          url: 'https://example.com/neural-networks', 
          title: 'Neural Network Applications in Information Verification',
          verified: true 
        },
      ];
      
      setActiveSources([...activeSources, ...newSources]);
      
      setChatHistory([
        ...chatHistory, 
        { 
          role: 'user', 
          content: userMessage 
        },
        { 
          role: 'assistant', 
          content: `I've analyzed your question using blockchain-verified sources.
          
          The implementation of advanced algorithms in source verification systems has demonstrated a 43% improvement in accuracy when combined with neural network applications. These systems utilize a three-layer verification process that cross-references data points against established academic sources.
          
          Would you like me to provide more specific information about any aspect of this process?`,
          sources: newSources
        }
      ]);
      
      setIsLoading(false);
    }, 2000);
  };
  
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "Disconnecting from the neural network...",
    });
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };
  
  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative">
      <CyberBackground />
      
      <div className="flex flex-grow relative z-10">
        {/* Chat History Sidebar */}
        <div className={`fixed md:relative inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-cyber-dark border-r border-white/10 flex flex-col z-30`}>
          <div className="p-4 border-b border-white/10 flex items-center">
            <History className="text-cyber-green mr-2" />
            <h2 className="text-xl font-bold">Query History</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green p-2">
            {chatHistory.filter(msg => msg.role === 'user').map((msg, index) => (
              <div key={index} className="mb-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                <p className="text-sm text-white/80 truncate">{msg.content}</p>
              </div>
            ))}
            {chatHistory.length === 0 && (
              <div className="text-center p-4 text-white/50">
                <p>No history yet</p>
                <p className="text-xs mt-2">Your research queries will appear here</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-cyber-green flex items-center justify-center mr-2">
                  <User className="w-4 h-4 text-cyber-dark" />
                </div>
                <span className="text-sm">Researcher</span>
              </div>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <button 
          className="md:hidden fixed top-4 left-4 z-40 bg-cyber-dark/80 p-2 rounded-full shadow-lg border border-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft className="text-cyber-green" /> : <ChevronRight className="text-cyber-green" />}
        </button>
        
        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-cyber-green">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="mb-4 p-4 rounded-full bg-cyber-dark/80 border border-cyber-green animate-pulse-neon">
                  <Search className="w-8 h-8 text-cyber-green" />
                </div>
                <h2 className="text-2xl font-bold cyber-text-gradient mb-2">Neural Research Hub</h2>
                <p className="text-white/60 max-w-md mb-4">
                  Your AI-powered research assistant with blockchain-verified sources
                </p>
                <p className="text-white/40 text-sm">
                  Start by typing your research query below
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-3xl ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                  >
                    <div 
                      className={`rounded-lg p-4 ${
                        msg.role === 'user' 
                          ? 'bg-cyber-magenta/20 border border-cyber-magenta/40 text-white' 
                          : 'bg-cyber-dark border border-cyber-green/40 text-white'
                      } shadow-glow`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>
                      
                      {msg.sources && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center text-xs text-white/60 mb-2">
                            <Link className="w-3 h-3 mr-1" />
                            <span>Sources:</span>
                          </div>
                          <div className="space-y-1">
                            {msg.sources.map((source, sIdx) => (
                              <div key={sIdx} className="flex items-center text-xs">
                                <Shield className="w-3 h-3 mr-1 text-cyber-green" />
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-cyber-cyan hover:underline truncate max-w-[260px]"
                                >
                                  {source.title}
                                </a>
                                <ExternalLink className="w-3 h-3 ml-1 text-white/40" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ask your research question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="cyber-input flex-grow"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="cyber-button min-w-[100px]"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    <span>Send</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Source Verification Panel */}
        <div className={`fixed md:relative inset-y-0 right-0 transform ${isSourcePanelOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-cyber-dark border-l border-white/10 flex flex-col z-30`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <Book className="text-cyber-green mr-2" />
              <h2 className="text-xl font-bold">Verified Sources</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:hidden"
              onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green p-4">
            {activeSources.length > 0 ? (
              <div className="space-y-4">
                {activeSources.map((source, index) => (
                  <div key={index} className="cyber-card p-3">
                    <div className="flex items-start">
                      <div className={`min-w-[24px] h-6 flex items-center justify-center rounded-full ${source.verified ? 'text-cyber-green' : 'text-cyber-magenta'} mr-2`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white mb-1">{source.title}</h3>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-cyber-cyan hover:underline flex items-center"
                        >
                          <span className="truncate max-w-[180px]">{source.url}</span>
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                        <div className="flex mt-2">
                          <span className={`text-xs py-0.5 px-2 rounded-full ${source.verified ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-magenta/20 text-cyber-magenta'}`}>
                            {source.verified ? 'Blockchain Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => toast({ title: "Source Saved", description: "Source bookmarked for future reference" })}
                      >
                        <BookmarkPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-white/50">
                <p>No sources yet</p>
                <p className="text-xs mt-2">Sources will appear here when your research query is processed</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile source panel toggle */}
        <button 
          className="md:hidden fixed top-4 right-4 z-40 bg-cyber-dark/80 p-2 rounded-full shadow-lg border border-white/10"
          onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
        >
          {isSourcePanelOpen ? <ChevronRight className="text-cyber-green" /> : <ChevronLeft className="text-cyber-green" />}
        </button>
      </div>
      
      {/* Settings Center */}
      <SettingsCenter open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Hub;
