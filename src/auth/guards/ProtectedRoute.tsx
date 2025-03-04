
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useEffect } from "react";

export const ProtectedRoute = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (loading) {
      console.log("🔄 ProtectedRoute: Loading authentication state...");
    } else if (user) {
      console.log(`✅ ProtectedRoute: User authenticated: ${user.email}`);
    } else {
      console.log("⚠️ ProtectedRoute: No authenticated user, redirecting to auth page");
    }
  }, [user, loading]);

  if (loading) {
    console.log("⏳ ProtectedRoute: Still loading, showing loading state");
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    console.log("🚫 ProtectedRoute: Redirecting to auth page");
    return <Navigate to="/auth" />;
  }

  return children;
};
