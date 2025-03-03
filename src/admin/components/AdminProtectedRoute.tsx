
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminPermission } from "@/admin/hooks/useAdminPermission";

export const AdminProtectedRoute = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminPermission();

  if (loading || isCheckingAdmin) return null;
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
