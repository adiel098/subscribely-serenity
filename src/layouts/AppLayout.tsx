
import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useAuthRedirect } from "@/auth/hooks/useAuthRedirect";

export const AppLayout = () => {
  const { isLoading: authLoading } = useAuth();
  const { isCheckingAuth } = useAuthRedirect();
  const [showLoading, setShowLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  
  // Add a small delay before showing content to prevent flickering
  useEffect(() => {
    // Set up the ref to track component mounted state
    mountedRef.current = true;
    const isPathChange = previousPathRef.current !== location.pathname;
    previousPathRef.current = location.pathname;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Only show loading for a maximum of 2 seconds to prevent infinite loading states
    if (!initialLoadTimerRef.current) {
      initialLoadTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setShowLoading(false);
        }
      }, 2000);
    }
    
    if (!authLoading && !isCheckingAuth) {
      // Path change - allow a small transition period
      if (isPathChange) {
        setShowLoading(true);
        // Add a small delay before showing content to ensure smooth transition
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setShowLoading(false);
          }
        }, 150);
      } else {
        // No path change - for smaller updates, transition faster
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setShowLoading(false);
          }
        }, 100);
      }
    } else {
      setShowLoading(true);
    }
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (initialLoadTimerRef.current) {
        clearTimeout(initialLoadTimerRef.current);
      }
    };
  }, [authLoading, isCheckingAuth, location.pathname]);

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
