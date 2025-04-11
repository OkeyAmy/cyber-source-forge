import React from 'react';
import { Shield, Share, User, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarTrigger from './SidebarTrigger';
import { cn } from '@/lib/utils';

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
  className
}: ChatHeaderProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Main header */}
      <header className="border-b border-cyber-green/30 p-4 flex items-center justify-between bg-cyber-dark/90 backdrop-blur-md shadow-[0_2px_10px_rgba(0,255,170,0.1)]">
        <div className="flex items-center">
          {/* Logo */}
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
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent flex items-center gap-1 transition-all duration-300"
            onClick={onExportChat}
          >
            <Share className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          {/* User Settings Button */}
          <Button
            variant="outline"
            size="icon"
            className="text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all duration-300"
            onClick={onOpenSettings}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-green/30 bg-cyber-dark/80 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <SidebarTrigger
            isOpen={isSidebarOpen}
            onClick={onToggleSidebar}
            className="md:hidden"
          />
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList className="bg-cyber-dark/70 border border-cyber-green/20 h-9">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green flex items-center gap-1 h-7 px-3"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sources" 
                className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green flex items-center gap-1 h-7 px-3"
              >
                <Sparkles className="h-3 w-3" />
                <span>Sources</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Source filters, only visible on sources tab */}
        {activeTab === 'sources' && (
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all text-xs h-7 px-3",
                currentSource === 'Reddit' && "border-cyber-green text-cyber-green bg-cyber-green/10"
              )}
              onClick={() => onSourceChange('Reddit')}
            >
              Reddit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all text-xs h-7 px-3",
                currentSource === 'Academic' && "border-cyber-green text-cyber-green bg-cyber-green/10"
              )}
              onClick={() => onSourceChange('Academic')}
            >
              Academic
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-white hover:text-cyber-green border-white/20 hover:border-cyber-green/40 bg-transparent transition-all text-xs h-7 px-3",
                currentSource === 'All Sources' && "border-cyber-green text-cyber-green bg-cyber-green/10"
              )}
              onClick={() => onSourceChange('All Sources')}
            >
              All Sources
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHeader; 