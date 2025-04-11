import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  User, Shield, X, Save, Trash2, 
  RefreshCw, Moon, Sun, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useChatHistory } from '@/hooks/useChatHistory';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';

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
  
  const [displayName, setDisplayName] = React.useState('Researcher');
  const [email, setEmail] = React.useState('');
  const [theme, setTheme] = React.useState<'system' | 'dark' | 'light'>('dark');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Initialize form with user settings
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.display_name || 'Researcher');
      setEmail(settings.email || '');
      setTheme(settings.theme || 'dark');
      
      // Reset changes tracker
      setHasChanges(false);
    }
  }, [settings]);
  
  // Track changes
  useEffect(() => {
    if (settings) {
      const hasNameChanged = displayName !== (settings.display_name || 'Researcher');
      const hasEmailChanged = email !== (settings.email || '');
      const hasThemeChanged = theme !== (settings.theme || 'dark');
      
      setHasChanges(hasNameChanged || hasEmailChanged || hasThemeChanged);
    }
  }, [displayName, email, theme, settings]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all your chat history? This action cannot be undone.')) {
      clearAllChatHistory();
      toast({
        title: "History cleared",
        description: "All your chat history has been removed.",
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await updateSettings({
        display_name: displayName,
        email: email,
        search_preferences: {
          focusArea: 'All',
          anonymousMode: false
        },
        theme
      });
      
      setHasChanges(false);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setDisplayName(settings.display_name || 'Researcher');
      setEmail(settings.email || '');
      setTheme(settings.theme || 'dark');
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="w-full sm:max-w-md bg-cyber-dark border-l border-white/10">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <RefreshCw className="h-10 w-10 text-cyber-green animate-spin" />
            <p className="text-white/70">Loading settings...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-cyber-dark border-l border-cyber-green/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-0 pb-0">
        <SheetHeader className="border-b border-cyber-green/20 p-4 sticky top-0 bg-cyber-dark/95 backdrop-blur-md z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center">
              <Shield className="h-5 w-5 text-cyber-green mr-2"/>
              <span className="text-cyber-green">SOURCE</span>
              <span className="text-white">FINDER</span>
              <span className="text-white/60 text-sm ml-2 font-normal">Settings</span>
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:text-cyber-green hover:bg-cyber-green/10 transition-colors">
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="h-[calc(100vh-12rem)] overflow-y-auto py-4 px-6 scrollbar-thin scrollbar-thumb-cyber-green/20 scrollbar-track-transparent">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-cyber-dark/70 border border-cyber-green/20 p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <Sun className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-20 w-20 rounded-full border-2 border-cyber-green flex items-center justify-center bg-cyber-green/10">
                  <User className="h-10 w-10 text-cyber-green" />
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <User className="h-4 w-4 mr-2 text-cyber-green" />
                  User Profile
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-white/80">Display Name</Label>
                    <Input 
                      id="display-name" 
                      className="bg-cyber-dark/70 border-white/20 focus:border-cyber-green/50 focus:ring-cyber-green/20" 
                      placeholder="Researcher" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email Address</Label>
                    <Input 
                      id="email" 
                      className="bg-cyber-dark/70 border-white/20 focus:border-cyber-green/50 focus:ring-cyber-green/20" 
                      type="email" 
                      placeholder="researcher@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-white/50 mt-1">Used for account recovery and notifications</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Sun className="h-4 w-4 mr-2 text-cyber-green" />
                  Display
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Theme</Label>
                    <RadioGroup 
                      value={theme} 
                      onValueChange={(value) => setTheme(value as 'system' | 'dark' | 'light')}
                      className="grid grid-cols-3 gap-2 mt-1"
                    >
                      <div>
                        <RadioGroupItem 
                          value="dark" 
                          id="theme-dark"
                          className="peer sr-only"
                        />
                        <Label 
                          htmlFor="theme-dark"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-white/20 bg-cyber-dark/80 p-3 hover:border-cyber-green/40 peer-data-[state=checked]:border-cyber-green/70 [&:has([data-state=checked])]:border-cyber-green/70 [&:has([data-state=checked])]:text-cyber-green cursor-pointer"
                        >
                          <Moon className="mb-2 h-5 w-5" />
                          <span className="text-xs">Dark</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="light" 
                          id="theme-light"
                          className="peer sr-only"
                        />
                        <Label 
                          htmlFor="theme-light"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-white/20 bg-cyber-dark/80 p-3 hover:border-cyber-green/40 peer-data-[state=checked]:border-cyber-green/70 [&:has([data-state=checked])]:border-cyber-green/70 [&:has([data-state=checked])]:text-cyber-green cursor-pointer"
                        >
                          <Sun className="mb-2 h-5 w-5" />
                          <span className="text-xs">Light</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="system" 
                          id="theme-system"
                          className="peer sr-only"
                        />
                        <Label 
                          htmlFor="theme-system"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-white/20 bg-cyber-dark/80 p-3 hover:border-cyber-green/40 peer-data-[state=checked]:border-cyber-green/70 [&:has([data-state=checked])]:border-cyber-green/70 [&:has([data-state=checked])]:text-cyber-green cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 h-5 w-5">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                          </svg>
                          <span className="text-xs">System</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Trash2 className="h-4 w-4 mr-2 text-cyber-green" />
                  Data Management
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={handleClearHistory} 
                      className="w-full justify-start border-white/20 hover:border-cyber-magenta/40 bg-transparent hover:bg-cyber-magenta/10 text-white hover:text-cyber-magenta transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat History
                    </Button>
                    <p className="text-xs text-white/50">Remove all previous conversations. This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter className="p-4 border-t border-cyber-green/20 bg-cyber-dark/95 backdrop-blur-md sticky bottom-0 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
          <div className="flex w-full gap-3">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 border-white/20 hover:border-cyber-green/40 bg-transparent hover:bg-cyber-green/5 text-white transition-colors"
              >
                Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                "flex-1 bg-cyber-green hover:bg-cyber-green/80 text-black transition-colors",
                isSaving && "opacity-70"
              )}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsCenter;
