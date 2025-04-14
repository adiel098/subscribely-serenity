
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useAuthRedirect } from "@/auth/hooks/useAuthRedirect";

export const AppLayout = () => {
  const { isLoading } = useAuth();
  const { isCheckingAuth } = useAuthRedirect();
  const [showLoading, setShowLoading] = useState(true);
  
  // Add a small delay before showing content to prevent flickering
  useEffect(() => {
    let mounted = true;
    
    if (!isLoading && !isCheckingAuth) {
      // Add a small delay before showing content to ensure smooth transition
      const timer = setTimeout(() => {
        if (mounted) {
          setShowLoading(false);
        }
      }, 100);
      
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    } else {
      setShowLoading(true);
    }
    
    return () => {
      mounted = false;
    };
  }, [isLoading, isCheckingAuth]);

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
