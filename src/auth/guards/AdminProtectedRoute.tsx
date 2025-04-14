import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useMemo, ReactNode, memo } from "react";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

// Loading component extracted to avoid re-renders
const AdminLoadingIndicator = memo(() => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <span className="ml-2 text-lg">Checking admin access...</span>
  </div>
));
AdminLoadingIndicator.displayName = 'AdminLoadingIndicator';

/**
 * AdminProtectedRoute - Only allows access to users with admin privileges
 * Uses memoization to prevent unnecessary re-renders
 */
export const AdminProtectedRoute = memo(({ children }: AdminProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'super_admin';
  }, [user]);

  if (loading) {
    return <AdminLoadingIndicator />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
});

AdminProtectedRoute.displayName = 'AdminProtectedRoute';
