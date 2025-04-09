
import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Shield, X, Save, DownloadCloud, Trash2, FileText, Lock } from 'lucide-react';
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
      <SheetContent className="w-full sm:max-w-md bg-cyber-dark border-l border-cyber-green/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <SheetHeader className="border-b border-cyber-green/20 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              <span className="text-cyber-green">SOURCE</span>
              <span className="text-white">FINDER</span>
              <span className="text-white/60 text-sm ml-2">Settings</span>
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:text-cyber-green hover:bg-cyber-green/10 transition-colors">
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-cyber-dark/70 border border-cyber-green/20">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <Lock className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-4 w-4 mr-2 text-cyber-green" />
                  User Profile
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      className="bg-cyber-dark/70 border-white/20 focus:border-cyber-green/50" 
                      placeholder="Researcher" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      className="bg-cyber-dark/70 border-white/20 focus:border-cyber-green/50" 
                      type="email" 
                      placeholder="researcher@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-cyber-green" />
                  Source Verification
                </h3>
                <div className="border border-white/10 rounded-md p-4 bg-cyber-dark/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Academic Verification</p>
                      <p className="text-xs text-white/60">Prioritize academic and peer-reviewed sources</p>
                    </div>
                    <div className="text-cyber-cyan text-xs flex items-center">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-cyber-green" />
                  Privacy Settings
                </h3>
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
                      className="data-[state=checked]:bg-cyber-green"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-cyber-green" />
                  Data Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center border-white/20 hover:border-cyber-green/40 bg-transparent hover:bg-cyber-green/5 transition-all"
                      onClick={handleExportData}
                    >
                      <DownloadCloud className="mr-2 h-4 w-4 text-cyber-green" />
                      Export Chat History
                    </Button>
                    <p className="text-xs text-white/60 mt-1">
                      Download your entire chat history and personal data
                    </p>
                  </div>
                  
                  <div>
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/30"
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
        
        <SheetFooter className="border-t border-cyber-green/20 pt-4">
          <Button 
            className="w-full bg-cyber-green hover:bg-cyber-green/90 text-black transition-all duration-300" 
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsCenter;
