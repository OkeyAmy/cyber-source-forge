import React from 'react';
import { Shield, Share, User, MessageSquare, Database, Menu, Search, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarTrigger from './SidebarTrigger';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface ChatHeaderProps {
  onExportChat: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
  currentSource: string;
  onSourceChange: (source: 'Reddit' | 'Academic' | 'All Sources') => void;
  className?: string;
  unreadCount?: number;
  sourcesCount?: number;
}

function ChatHeader({
  onExportChat,
  onOpenSettings,
  onToggleSidebar,
  isSidebarOpen,
  activeTab,
  onTabChange,
  currentSource,
  onSourceChange,
  className,
  unreadCount = 0,
  sourcesCount = 0
}: ChatHeaderProps) {
  return (
    <div className={cn("flex flex-col sticky top-0 z-30", className)}>
      {/* Main header with refined glass morphism effect */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-900/95 to-black/90 backdrop-blur-lg shadow-md">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button with smoother hover */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden text-white hover:text-cyber-green hover:bg-black/20 transition-colors duration-200 h-9 w-9 rounded-full"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo with refined design */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl border border-cyber-green/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,170,0.2)] transition-all duration-300 hover:shadow-[0_0_16px_rgba(0,255,170,0.3)]">
              <Shield className="text-cyber-green w-5 h-5" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold leading-none flex items-baseline">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-green to-cyber-cyan mr-1">SOURCE</span>
                <span className="text-white">FINDER</span>
              </h1>
              <p className="text-[11px] text-white/60 mt-0.5 font-light tracking-wide">Verifying truth in the digital age</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5">
          {/* Export Button with clean styling */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:text-cyber-green hover:bg-black/20 flex items-center h-9 px-3 rounded-lg transition-all duration-200"
            onClick={onExportChat}
          >
            <Share className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline text-sm">Export</span>
          </Button>
          
          {/* User Settings Button with refined hover */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:text-cyber-green hover:bg-black/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
            onClick={onOpenSettings}
          >
            <User className="h-4.5 w-4.5" />
          </Button>
        </div>
      </header>
      
      {/* Tab navigation with cleaner styling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2.5 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="flex items-center">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList className="h-9 p-1 bg-transparent">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-cyber-green/10 data-[state=active]:text-cyber-green data-[state=active]:border-b-2 data-[state=active]:border-cyber-green flex items-center gap-1.5 h-8 px-3 rounded-none transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Chat</span>
                {unreadCount > 0 && (
                  <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-cyber-green/10 text-cyber-green border-cyber-green/20">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="sources" 
                className="data-[state=active]:bg-cyber-green/10 data-[state=active]:text-cyber-green data-[state=active]:border-b-2 data-[state=active]:border-cyber-green flex items-center gap-1.5 h-8 px-3 rounded-none transition-all duration-200"
              >
                <Database className="h-4 w-4" />
                <span className="font-medium">Sources</span>
                {sourcesCount > 0 && (
                  <Badge variant="outline" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-cyber-green/10 text-cyber-green border-cyber-green/20">
                    {sourcesCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Source filter pills with refined design */}
        {activeTab === 'sources' && (
          <div className="flex items-center mt-2 sm:mt-0 space-x-2 overflow-x-auto hide-scrollbar">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all text-xs h-7 px-4 flex items-center gap-2",
                currentSource === 'Reddit' && "bg-gradient-to-r from-orange-600/20 to-orange-500/10 text-orange-400 border border-orange-500/20"
              )}
              onClick={() => onSourceChange('Reddit')}
            >
              <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
              Reddit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all text-xs h-7 px-4 flex items-center gap-2",
                currentSource === 'Academic' && "bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-400 border border-blue-500/20"
              )}
              onClick={() => onSourceChange('Academic')}
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              Academic
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all text-xs h-7 px-4 flex items-center gap-2",
                currentSource === 'All Sources' && "bg-gradient-to-r from-cyber-green/20 to-cyber-green/5 text-cyber-green border border-cyber-green/20"
              )}
              onClick={() => onSourceChange('All Sources')}
            >
              <span className="flex h-2 w-2 rounded-full bg-cyber-green"></span>
              All Sources
            </Button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default ChatHeader;