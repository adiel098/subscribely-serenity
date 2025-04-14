
import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";

export function useAuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isRedirectingRef = useRef(false);
  const previousPathRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup function to prevent memory leaks
  const cleanupTimer = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
  };
  
  // Debounced redirect function
  const performRedirect = useCallback((to: string, replace = true) => {
    if (isRedirectingRef.current || previousPathRef.current === to) return false;
    
    isRedirectingRef.current = true;
    setIsRedirecting(true);
    previousPathRef.current = to;
    
    console.log(`Redirecting to: ${to}`);
    navigate(to, { replace });
    
    // Reset redirection flag after a delay
    setTimeout(() => {
      isRedirectingRef.current = false;
      setIsRedirecting(false);
    }, 1000);
    
    return true;
  }, [navigate]);
  
  useEffect(() => {
    // Skip redirects during loading to avoid flashing
    if (isLoading) {
      return cleanupTimer();
    }

    // Debounce redirects to prevent multiple redirects in quick succession
    cleanupTimer();
    
    // Set a max wait time to avoid getting stuck
    maxWaitTimerRef.current = setTimeout(() => {
      // If user is logged in and on the auth page, redirect to dashboard
      if (user && location.pathname === '/auth') {
        performRedirect('/dashboard');
        return;
      }
      
      // If user is NOT logged in and NOT on the auth page, redirect to auth
      if (!user && location.pathname !== '/auth') {
        performRedirect('/auth');
        return;
      }
    }, 2000);
    
    debounceTimerRef.current = setTimeout(() => {
      // If user is logged in and on the auth page, redirect to dashboard
      if (user && location.pathname === '/auth') {
        performRedirect('/dashboard');
        return;
      }
      
      // If user is NOT logged in and NOT on the auth page, redirect to auth
      if (!user && location.pathname !== '/auth') {
        performRedirect('/auth');
        return;
      }
    }, 500); // Increased debounce time for more stability
    
    // Clean up on unmount
    return cleanupTimer;
  }, [user, isLoading, performRedirect, location.pathname]);
  
  return {
    isCheckingAuth: isLoading || isRedirecting
  };
}
