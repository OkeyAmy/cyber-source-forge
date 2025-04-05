
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Mail, ArrowRight, Github, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import CyberBackground from '@/components/CyberBackground';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (values: { email: string, password: string }) => {
    setIsLoading(true);
    
    // Simulate auth process
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Authentication successful",
        description: "Welcome to the Source Finder neural network.",
      });
      
      // Redirect to hub page
      navigate('/hub');
    }, 1500);
  };
  
  const handleWalletConnect = () => {
    toast({
      title: "Web3 Authentication",
      description: "Wallet connection coming soon in future updates.",
    });
  };
  
  const handleOAuthLogin = (provider: string) => {
    toast({
      title: `${provider} Authentication`,
      description: "OAuth integration coming soon in future updates.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark text-white relative">
      <CyberBackground />
      
      <div className="flex flex-col items-center justify-center flex-grow px-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-block border-2 border-cyber-green rounded-full p-4 animate-pulse-neon mb-4">
              <Bot className="w-8 h-8 text-cyber-green" />
            </div>
            <h1 className="text-3xl font-bold cyber-text-gradient mb-2">
              {isSignUp ? 'Create Neural Link' : 'Establish Connection'}
            </h1>
            <p className="text-white/60">
              {isSignUp ? 'Register to access the full neural network' : 'Authenticate to continue your research'}
            </p>
          </div>
          
          <div className="cyber-card p-6 mb-6">
            <Button 
              variant="outline" 
              className="w-full mb-4 cyber-button-outline flex items-center justify-center"
              onClick={handleWalletConnect}
            >
              <Wallet className="mr-2 h-4 w-4" />
              <span>Connect Crypto Wallet</span>
              <span className="ml-2 text-xs text-cyber-cyan">(Coming Soon)</span>
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-cyber-dark text-white/60">or continue with</span>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          className="cyber-input" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your password" 
                          className="cyber-input" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full cyber-button" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Bot className="mr-2 h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                className="w-full cyber-button-outline flex items-center justify-center"
                onClick={() => handleOAuthLogin('GitHub')}
              >
                <Github className="mr-2 h-4 w-4" />
                <span>Continue with GitHub</span>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-cyber-green hover:text-cyber-cyan transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
