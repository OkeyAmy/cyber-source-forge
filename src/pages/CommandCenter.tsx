
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Search, Shield, Book, User, LogOut, Settings, History, Send, Calendar, Link, ExternalLink, Filter, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CyberBackground from '@/components/CyberBackground';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CommandCenter = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string; timestamp?: string; sources?: { url: string; title: string; verified: boolean; }[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);
  const [activeSources, setActiveSources] = useState<{ url: string; title: string; verified: boolean; tracePath?: string[] }[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    setChatHistory([...chatHistory, { 
      role: 'user', 
      content: query,
      timestamp: new Date().toISOString()
    }]);
    
    setIsLoading(true);
    
    // Simulate AI response with sources
    setTimeout(() => {
      const newSources = [
        { 
          url: 'https://example.com/research-paper-1', 
          title: 'Comprehensive Analysis of Neural Networks in Source Verification',
          verified: true,
          tracePath: ['Academic Database', 'Peer Review', 'Blockchain Verification']
        },
        { 
          url: 'https://example.com/blockchain-verification', 
          title: 'Blockchain-Based Verification Models for Academic Research',
          verified: true,
          tracePath: ['Web Archive', 'Blockchain Verification', 'Cross-Reference']
        },
        { 
          url: 'https://example.com/credibility-metrics', 
          title: 'Establishing Credibility Metrics in Digital Source Evaluation',
          verified: false,
          tracePath: ['Web Crawler', 'Pending Verification']
        },
      ];
      
      setActiveSources(newSources);
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Based on verified sources, I can provide a comprehensive answer to your query "${query}".
        
        The integration of neural networks in source verification has shown significant improvements in accuracy rates, with an average increase of 27% compared to traditional methods. Blockchain-based verification adds an immutable layer of trust, particularly valuable for academic research where provenance is crucial.
        
        Current credibility metrics suggest implementing a multi-factorial approach that weighs source reputation, citation frequency, and verification status using a distributed ledger system.`,
        timestamp: new Date().toISOString(),
        sources: newSources
      }]);
      
      setIsLoading(false);
    }, 2000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage('');
    
    const newUserMessage = { 
      role: 'user' as const, 
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const newSources = [
        { 
          url: 'https://example.com/advanced-algorithms', 
          title: 'Advanced Algorithms in Source Verification Systems',
          verified: true,
          tracePath: ['Academic Database', 'Blockchain Verification']
        },
        { 
          url: 'https://example.com/neural-networks', 
          title: 'Neural Network Applications in Information Verification',
          verified: true,
          tracePath: ['Web Archive', 'Peer Review', 'Cross-Reference']
        },
      ];
      
      setActiveSources(prev => [...prev, ...newSources]);
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `I've analyzed your question using blockchain-verified sources.
        
        The implementation of advanced algorithms in source verification systems has demonstrated a 43% improvement in accuracy when combined with neural network applications. These systems utilize a three-layer verification process that cross-references data points against established academic sources.
        
        Would you like me to provide more specific information about any aspect of this process?`,
        timestamp: new Date().toISOString(),
        sources: newSources
      }]);
      
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
              <div key={index} className="mb-3 hover:bg-white/5 rounded cursor-pointer">
                <div className="p-2">
                  <p className="text-sm text-white/80 truncate">{msg.content}</p>
                  {msg.timestamp && (
                    <div className="flex items-center text-xs text-white/40 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSettingsOpen(true)}>
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
                <h2 className="text-2xl font-bold cyber-text-gradient mb-2">AI Command Center</h2>
                <p className="text-white/60 max-w-md mb-4">
                  Your neural network research assistant with blockchain-verified sources
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
                                <Shield className={`w-3 h-3 mr-1 ${source.verified ? 'text-cyber-green' : 'text-cyber-magenta'}`} />
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
                      
                      {msg.timestamp && (
                        <div className="flex items-center text-xs text-white/40 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
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
              <h2 className="text-xl font-bold">Source Preview</h2>
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
                        
                        {source.tracePath && (
                          <div className="mt-2 border-t border-white/10 pt-2">
                            <p className="text-xs text-white/60 mb-1">Trace Path:</p>
                            <div className="flex flex-wrap gap-1">
                              {source.tracePath.map((path, pIdx) => (
                                <React.Fragment key={pIdx}>
                                  <span className="text-[10px] text-cyber-cyan">{path}</span>
                                  {pIdx < source.tracePath!.length - 1 && (
                                    <ChevronRight className="w-2 h-2 text-white/40" />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex mt-2">
                          <span className={`text-xs py-0.5 px-2 rounded-full ${source.verified ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-magenta/20 text-cyber-magenta'}`}>
                            {source.verified ? 'Blockchain Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
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
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold cyber-text-gradient">Settings Center</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSettingsOpen(false)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <Tabs defaultValue="profile">
                <TabsList className="mb-6 w-full grid grid-cols-3">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                    <User className="w-4 h-4 mr-2" />
                    Profile & Wallet
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                    <Filter className="w-4 h-4 mr-2" />
                    Search Preferences
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy & Data
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <div className="cyber-card p-4">
                    <h3 className="text-lg font-medium mb-4">User Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Username</label>
                        <Input placeholder="CyberResearcher" className="cyber-input" />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Email</label>
                        <Input placeholder="user@example.com" className="cyber-input" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="cyber-card p-4">
                    <h3 className="text-lg font-medium mb-4">Wallet Connection</h3>
                    <p className="text-white/60 text-sm mb-4">Connect your wallet to enable blockchain verification features.</p>
                    <Button className="cyber-button-outline w-full">
                      <span className="text-cyber-magenta">Connect Wallet</span>
                      <span className="text-xs ml-2 text-white/60">(Coming Soon)</span>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="space-y-6">
                  <div className="cyber-card p-4">
                    <h3 className="text-lg font-medium mb-4">Search Engine Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Default Source Type</label>
                        <select className="cyber-input w-full">
                          <option>Academic Sources</option>
                          <option>News Articles</option>
                          <option>Research Papers</option>
                          <option>All Sources</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Verification Level</label>
                        <select className="cyber-input w-full">
                          <option>Blockchain Verified Only</option>
                          <option>Peer-Reviewed Only</option>
                          <option>All Sources (With Verification Status)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cyber-card p-4">
                    <h3 className="text-lg font-medium mb-4">AI Response Format</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Response Length</label>
                        <select className="cyber-input w-full">
                          <option>Concise</option>
                          <option>Detailed</option>
                          <option>Comprehensive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Source Citation Style</label>
                        <select className="cyber-input w-full">
                          <option>Inline Links</option>
                          <option>Footnotes</option>
                          <option>End References</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy" className="space-y-6">
                  <div className="cyber-card p-4">
                    <h3 className="text-lg font-medium mb-4">Data Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Save Search History</p>
                          <p className="text-sm text-white/60">Store your search queries for future reference</p>
                        </div>
                        <div className="h-6 w-12 bg-white/10 rounded-full relative flex items-center p-1 cursor-pointer">
                          <div className="absolute h-4 w-4 rounded-full bg-cyber-green right-1"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Anonymous Usage Data</p>
                          <p className="text-sm text-white/60">Share anonymous usage statistics to improve the service</p>
                        </div>
                        <div className="h-6 w-12 bg-white/10 rounded-full relative flex items-center p-1 cursor-pointer">
                          <div className="absolute h-4 w-4 rounded-full bg-cyber-green right-1"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Save Sources Locally</p>
                          <p className="text-sm text-white/60">Cache verified sources on your device</p>
                        </div>
                        <div className="h-6 w-12 bg-white/10 rounded-full relative flex items-center p-1 cursor-pointer">
                          <div className="absolute h-4 w-4 rounded-full bg-white/40 left-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cyber-card p-4">
                    <h3 className="text-lg font-medium mb-4">Data Export & Deletion</h3>
                    <div className="space-y-4">
                      <Button className="cyber-button-outline w-full">
                        Export My Data
                      </Button>
                      <Button className="border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 w-full rounded-md py-2">
                        Delete All My Data
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;
