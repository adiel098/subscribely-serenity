
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useAuthRedirect } from "@/auth/hooks/useAuthRedirect";

export const AppLayout = () => {
  const { isLoading } = useAuth();
  const { isCheckingAuth } = useAuthRedirect();
  
  // Show loading screen while either auth is loading or redirect is happening
  const showLoading = isLoading || isCheckingAuth;

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

export default AppLayout;
