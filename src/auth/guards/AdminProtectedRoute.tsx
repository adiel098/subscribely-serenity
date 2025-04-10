
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/hooks/useAuth";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

/**
 * AdminProtectedRoute - Only allows access to users with admin privileges
 */
export const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'super_admin';
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg">Checking admin access...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
