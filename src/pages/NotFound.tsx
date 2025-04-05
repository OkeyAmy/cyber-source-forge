
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FileSearch, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import CyberBackground from "@/components/CyberBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-dark relative">
      <CyberBackground />
      
      <div className="text-center relative z-10 p-8 cyber-card max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 border-2 border-cyber-magenta rounded-full flex items-center justify-center animate-pulse-neon">
          <FileSearch className="w-10 h-10 text-cyber-magenta" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 cyber-text-gradient">404</h1>
        <p className="text-xl text-white/80 mb-6">Neural connection failed. Node not found in the cyberweb matrix.</p>
        
        <div className="inline-block relative">
          <Button asChild className="cyber-button">
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Return to Command Center</span>
            </a>
          </Button>
        </div>
        
        <div className="mt-6 text-cyber-cyan text-sm font-mono">
          [Error Code: CYB3R-404-NODE-MISSING]
        </div>
      </div>
    </div>
  );
};

export default NotFound;
