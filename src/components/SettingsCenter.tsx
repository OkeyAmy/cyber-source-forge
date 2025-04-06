
import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Search, Shield, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useUserSettings, SearchPreferences } from '@/hooks/useUserSettings';

interface SettingsCenterProps {
  open: boolean;
  onClose: () => void;
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const { settings, isLoading, updateSettings } = useUserSettings();
  
  const [displayName, setDisplayName] = React.useState('Researcher');
  const [email, setEmail] = React.useState('');
  const [searchPreferences, setSearchPreferences] = React.useState<SearchPreferences>({
    focusArea: 'Research',
    anonymousMode: false,
  });
  const [privacySettings, setPrivacySettings] = React.useState({
    saveHistory: true,
    dataCollection: true
  });

  // Initialize form with user settings
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.display_name || 'Researcher');
      setEmail(settings.email || '');
      setSearchPreferences(settings.search_preferences || {
        focusArea: 'Research',
        anonymousMode: false,
      });
      setPrivacySettings(settings.privacy_settings || {
        saveHistory: true,
        dataCollection: true
      });
    }
  }, [settings]);

  const handleFocusAreaChange = (value: string) => {
    setSearchPreferences({
      ...searchPreferences,
      focusArea: value as 'Research' | 'Social' | 'All'
    });
  };

  const handleAnonymousModeChange = () => {
    setSearchPreferences({
      ...searchPreferences,
      anonymousMode: !searchPreferences.anonymousMode
    });
  };

  const handlePrivacySettingChange = (setting: keyof typeof privacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
  };

  const handleSave = () => {
    updateSettings({
      display_name: displayName,
      email: email,
      search_preferences: searchPreferences,
      privacy_settings: privacySettings
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
            <SheetTitle className="text-xl font-bold cyber-text-gradient">Settings Center</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-cyber-dark/50 border border-white/10">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <User className="h-4 w-4" />
                <span>Profile & Wallet</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <Search className="h-4 w-4" />
                <span>Search</span>
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
            
            <TabsContent value="search" className="space-y-4">
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">Search Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="focus-area">Focus Area</Label>
                      <p className="text-xs text-white/60">Specify your focus area for search results</p>
                    </div>
                    <Select 
                      value={searchPreferences.focusArea} 
                      onValueChange={handleFocusAreaChange}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Research" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="All">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous-mode">Anonymous Mode</Label>
                      <p className="text-xs text-white/60">Search without linking to your identity</p>
                    </div>
                    <Switch 
                      id="anonymous-mode" 
                      checked={searchPreferences.anonymousMode}
                      onCheckedChange={handleAnonymousModeChange}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">Privacy & Data Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="save-history">Save Search History</Label>
                      <p className="text-xs text-white/60">Store your search queries for future reference</p>
                    </div>
                    <Switch 
                      id="save-history" 
                      checked={privacySettings.saveHistory}
                      onCheckedChange={() => handlePrivacySettingChange('saveHistory')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-xs text-white/60">Allow anonymous usage data collection</p>
                    </div>
                    <Switch 
                      id="data-collection" 
                      checked={privacySettings.dataCollection}
                      onCheckedChange={() => handlePrivacySettingChange('dataCollection')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="cyber-card p-4">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full cyber-button-outline">
                    Export My Data
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Clear Search History
                  </Button>
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
