
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Search, Shield, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SettingsCenterProps {
  open: boolean;
  onClose: () => void;
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('Researcher');
  const [email, setEmail] = useState('researcher@example.com');
  const [settings, setSettings] = useState({
    academicSources: true,
    blockchainVerified: false,
    recency: true,
    saveHistory: true,
    anonymousMode: false,
    dataCollection: true
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully."
    });
    onClose();
  };

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="academic-sources">Academic Sources</Label>
                      <p className="text-xs text-white/60">Prioritize academic and peer-reviewed sources</p>
                    </div>
                    <Switch 
                      id="academic-sources" 
                      checked={settings.academicSources}
                      onCheckedChange={() => handleSettingChange('academicSources')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="blockchain-verified">Blockchain Verification</Label>
                      <p className="text-xs text-white/60">Only show sources with blockchain verification</p>
                    </div>
                    <Switch 
                      id="blockchain-verified" 
                      checked={settings.blockchainVerified}
                      onCheckedChange={() => handleSettingChange('blockchainVerified')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="recency">Recency Preference</Label>
                      <p className="text-xs text-white/60">Prioritize more recent sources</p>
                    </div>
                    <Switch 
                      id="recency" 
                      checked={settings.recency}
                      onCheckedChange={() => handleSettingChange('recency')}
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
                      checked={settings.saveHistory}
                      onCheckedChange={() => handleSettingChange('saveHistory')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous-mode">Anonymous Mode</Label>
                      <p className="text-xs text-white/60">Search without storing personal data</p>
                    </div>
                    <Switch 
                      id="anonymous-mode" 
                      checked={settings.anonymousMode}
                      onCheckedChange={() => handleSettingChange('anonymousMode')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-xs text-white/60">Allow anonymous usage data collection</p>
                    </div>
                    <Switch 
                      id="data-collection" 
                      checked={settings.dataCollection}
                      onCheckedChange={() => handleSettingChange('dataCollection')}
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
