
import React, { useState } from 'react';
import { Lock, Mail, User, Wallet, LogIn, CircleUserRound, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CyberBackground from '@/components/CyberBackground';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleConnect = () => {
    toast({
      title: "Wallet Connection",
      description: "This feature is coming soon.",
    });
  };
  
  const handleAuth = (e: React.FormEvent, mode: 'login' | 'signup') => {
    e.preventDefault();
    
    if (mode === 'signup' && !name) {
      toast({
        title: "Input Required",
        description: "Please enter your name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!email || !password) {
      toast({
        title: "Input Required",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      toast({
        title: mode === 'login' ? "Login Successful" : "Account Created",
        description: "Access to neural systems granted.",
      });
      
      setTimeout(() => {
        navigate('/command-center');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative">
      <CyberBackground />
      
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold cyber-text-gradient mb-2">
              Neural Network Access
            </h1>
            <p className="text-white/60">
              Authenticate to access the Source Finder neural system
            </p>
          </div>
          
          <div className="cyber-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyber-magenta via-cyber-cyan to-cyber-green opacity-70"></div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                  <CircleUserRound className="h-4 w-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/40" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="cyber-input pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/40" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="cyber-input pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="cyber-button w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        <span>Login</span>
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={(e) => handleAuth(e, 'signup')} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-white/40" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Name"
                        className="cyber-input pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/40" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="cyber-input pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/40" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="cyber-input pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="cyber-button w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <CircleUserRound className="h-4 w-4 mr-2" />
                        <span>Sign Up</span>
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-center text-sm text-white/60 mb-4">
                <span>Or continue with wallet</span>
              </div>
              
              <Button 
                onClick={handleConnect} 
                className="w-full bg-cyber-dark border border-white/20 text-white hover:bg-white/5 hover:border-cyber-green transition-colors"
              >
                <Wallet className="h-4 w-4 mr-2 text-cyber-magenta" />
                <span>Connect Wallet</span>
                <span className="text-xs ml-2 text-white/60">(Coming Soon)</span>
              </Button>
              
              <div className="flex items-center mt-4 p-3 bg-cyber-magenta/10 rounded-md border border-cyber-magenta/30">
                <AlertTriangle className="h-4 w-4 text-cyber-magenta mr-2 flex-shrink-0" />
                <p className="text-xs text-white/80">
                  This is a demo application. No real authentication or blockchain verification is enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
