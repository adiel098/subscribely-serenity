
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminPermission } from "@/admin/hooks/useAdminPermission";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export const AdminProtectedRoute = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminPermission();
  const { toast } = useToast();

  useEffect(() => {
    // Show toast when access is denied due to not being an admin
    if (!loading && !isCheckingAdmin && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive"
      });
    }
  }, [user, isAdmin, loading, isCheckingAdmin, toast]);

  if (loading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying admin permissions...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};
