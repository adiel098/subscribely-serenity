
import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useAuthRedirect } from "@/auth/hooks/useAuthRedirect";

export const AppLayout = () => {
  const { isLoading } = useAuth();
  const { isCheckingAuth } = useAuthRedirect();
  const [showLoading, setShowLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Add a small delay before showing content to prevent flickering
  useEffect(() => {
    // Set up the ref to track component mounted state
    mountedRef.current = true;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!isLoading && !isCheckingAuth) {
      // Add a small delay before showing content to ensure smooth transition
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setShowLoading(false);
        }
      }, 300);
    } else {
      setShowLoading(true);
    }
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
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
