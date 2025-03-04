
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminPermission } from "@/admin/hooks/useAdminPermission";
import { Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const AdminProtectedRoute = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin, error } = useAdminPermission();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 AdminProtectedRoute state:", { 
      user: user?.email,
      authLoading: loading,
      isAdmin,
      isCheckingAdmin,
      error,
      currentPath: window.location.pathname
    });
    
    // Show toast when access is denied due to not being an admin
    if (!loading && !isCheckingAdmin && user && !isAdmin) {
      console.log("⛔ AdminProtectedRoute: Access denied for user", user.email);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive"
      });
    }
  }, [user, isAdmin, loading, isCheckingAdmin, toast, error]);

  if (loading || isCheckingAdmin) {
    console.log("⏳ AdminProtectedRoute: Loading state", { authLoading: loading, adminLoading: isCheckingAdmin });
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Verifying admin permissions...</span>
      </div>
    );
  }
  
  if (!user) {
    console.log("🚫 AdminProtectedRoute: No authenticated user, redirecting to auth");
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    console.log("🚫 AdminProtectedRoute: User is not an admin, showing access denied");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have administrator permissions.</p>
        <Button 
          onClick={() => navigate("/dashboard")} 
          className="px-6"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  console.log("✅ AdminProtectedRoute: User is admin, rendering admin content");
  return <>{children}</>;
};
