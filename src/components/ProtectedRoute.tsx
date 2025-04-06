
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cyber-dark">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyber-green animate-spin mx-auto mb-4" />
          <p className="text-white">Establishing neural connection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
