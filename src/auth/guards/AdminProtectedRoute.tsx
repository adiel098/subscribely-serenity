import { Navigate, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useAdminPermission } from "@/auth/hooks/useAdminPermission";
import { Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const AdminProtectedRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin, error, hasToastShown } = useAdminPermission();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    console.log("🔍 AdminProtectedRoute state:", { 
      user: user?.email,
      userId: user?.id,
      authLoading,
      isAdmin,
      isCheckingAdmin,
      error,
      currentPath: window.location.pathname
    });
    
    // For debugging only - check admin_users table directly
    const checkAdminUserTable = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id);
            
          console.log("🔍 Direct admin_users check:", { data, error });
        } catch (e) {
          console.error("Error checking admin_users table:", e);
        }
      }
    };
    
    if (user && !isCheckingAdmin && !isAdmin) {
      checkAdminUserTable();
    }
    
    // Show toast when access is denied due to not being an admin
    // Only show once per session and only after authentication checks complete
    if (!authLoading && !isCheckingAdmin && user && !isAdmin && !hasShownToast && !hasToastShown.current) {
      console.log("⛔ AdminProtectedRoute: Access denied for user", user.email);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive"
      });
      setHasShownToast(true);
      hasToastShown.current = true;
    }

    // Show toast if there's an error checking admin status (but only once)
    if (error && !isCheckingAdmin && !hasShownToast && !hasToastShown.current) {
      console.error("❌ AdminProtectedRoute: Error checking admin status:", error);
      toast({
        title: "Error",
        description: "There was a problem verifying your admin status. Please try again.",
        variant: "destructive"
      });
      setHasShownToast(true);
      hasToastShown.current = true;
    }
  }, [user, isAdmin, authLoading, isCheckingAdmin, toast, error, hasShownToast]);

  // If still loading auth or checking admin status, show loading state
  if (authLoading || isCheckingAdmin) {
    console.log("⏳ AdminProtectedRoute: Loading state", { 
      authLoading, 
      adminLoading: isCheckingAdmin,
      userId: user?.id
    });
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Verifying admin permissions...</span>
        {isCheckingAdmin && (
          <p className="text-gray-500 mt-2">This may take a moment. Please wait...</p>
        )}
      </div>
    );
  }
  
  // If no user is authenticated, redirect to auth page
  if (!user) {
    console.log("🚫 AdminProtectedRoute: No authenticated user, redirecting to auth");
    return <Navigate to="/auth" />;
  }
  
  // If user is not an admin, show access denied
  if (!isAdmin) {
    console.log("🚫 AdminProtectedRoute: User is not an admin, showing access denied");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have administrator permissions.</p>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="px-6"
          >
            Return to Dashboard
          </Button>
          <Button 
            onClick={() => navigate("/auth")} 
            variant="outline"
            className="px-6"
          >
            Sign In with Different Account
          </Button>
        </div>
      </div>
    );
  }

  console.log("✅ AdminProtectedRoute: User is admin, rendering admin content");
  return <Outlet />;
};
