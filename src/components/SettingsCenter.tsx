
import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Shield, X, Save, DownloadCloud, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useChatHistory } from '@/hooks/useChatHistory';

interface SettingsCenterProps {
  open: boolean;
  onClose: () => void;
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const { settings, isLoading, updateSettings } = useUserSettings();
  
  // Create simplified version for chatHistory functions
  const chatHistoryHook = useChatHistory();
  const clearAllChatHistory = chatHistoryHook.clearAllChatHistory || (() => Promise.resolve());
  const exportChatData = chatHistoryHook.exportChatData || (() => Promise.resolve());
  
  const [displayName, setDisplayName] = React.useState('Researcher');
  const [email, setEmail] = React.useState('');
  const [anonymousMode, setAnonymousMode] = React.useState(false);

  // Initialize form with user settings
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.display_name || 'Researcher');
      setEmail(settings.email || '');
      setAnonymousMode(settings.search_preferences?.anonymousMode || false);
    }
  }, [settings]);

  const handleAnonymousModeChange = () => {
    setAnonymousMode(!anonymousMode);
  };

  const handleExportData = () => {
    exportChatData();
    toast({
      title: "Data exported",
      description: "Your data has been downloaded.",
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all your chat history?')) {
      clearAllChatHistory();
      toast({
        title: "History cleared",
        description: "All your chat history has been removed.",
      });
    }
  };

  const handleSave = () => {
    updateSettings({
      display_name: displayName,
      email: email,
      search_preferences: {
        focusArea: settings?.search_preferences?.focusArea || 'Research',
        anonymousMode: anonymousMode
      },
    });
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="w-full sm:max-w-md bg-cyber-dark border-l border-white/10">
          <div className="flex items-center justify-center h-full">
            <p>Loading settings...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-cyber-dark border-l border-white/10">
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold cyber-text-gradient">Settings</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-cyber-dark/50 border border-white/10">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <User className="h-4 w-4" />
                <span>Profile & Wallet</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">User Profile</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      className="cyber-input" 
                      placeholder="Researcher" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      className="cyber-input" 
                      type="email" 
                      placeholder="researcher@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">Wallet Connection</h3>
                <div className="border border-white/10 rounded-md p-4 bg-cyber-dark/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">MetaMask Integration</p>
                      <p className="text-xs text-white/60">Secure blockchain authentication</p>
                    </div>
                    <div className="text-cyber-cyan text-xs flex items-center">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous-mode">Anonymous Mode</Label>
                      <p className="text-xs text-white/60">Search without saving to your history</p>
                    </div>
                    <Switch 
                      id="anonymous-mode" 
                      checked={anonymousMode}
                      onCheckedChange={handleAnonymousModeChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div>
                    <Button 
                      variant="outline" 
                      className="w-full cyber-button-outline flex items-center"
                      onClick={handleExportData}
                    >
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Export Chat History
                    </Button>
                    <p className="text-xs text-white/60 mt-1">
                      Download your entire chat history and personal data
                    </p>
                  </div>
                  
                  <div>
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center"
                      onClick={handleClearHistory}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Chat History
                    </Button>
                    <p className="text-xs text-white/60 mt-1">
                      Remove all your conversations from the database
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter className="border-t border-white/10 pt-4">
          <Button className="cyber-button w-full" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsCenter;
