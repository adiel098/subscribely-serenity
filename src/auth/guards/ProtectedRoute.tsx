import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useEffect, useState, useRef, ReactNode, memo } from "react";
import { Loader2 } from "lucide-react";
import { useOnboardingStatus } from "@/group_owners/hooks/useOnboardingStatus";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Loading component extracted to avoid re-renders
const LoadingIndicator = memo(() => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <span className="ml-2 text-lg">Loading...</span>
  </div>
));
LoadingIndicator.displayName = 'LoadingIndicator';

/**
 * ProtectedRoute - Ensures that only authenticated users can access certain routes
 * If a user tries to access a protected route without being logged in, they are redirected to the login page
 * This optimized version reduces unnecessary state changes and improves performance
 */
export const ProtectedRoute = memo(({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);
  const { checkOnboardingStatus } = useOnboardingStatus();
  const checkPerformedRef = useRef(false);
  const processingRef = useRef(false);
  
  // Use a single loading state with optimized timeout handling
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Efficiently handle loading state changes
  useEffect(() => {
    if (!loading && !isCheckingOnboarding) {
      // Use a short timer to prevent flickering during quick state changes
      loadingTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    } else {
      setIsLoading(true);
    }
    
    // Maximum loading time of 3 seconds
    const maxLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      clearTimeout(maxLoadingTimer);
    };
  }, [loading, isCheckingOnboarding]);

  // Efficiently check onboarding status
  useEffect(() => {
    // Don't run if already checking or if the check was already performed
    if (processingRef.current || !user || checkPerformedRef.current) return;
    
    const checkIfShouldRedirect = async () => {
      // Skip onboarding check if already on onboarding page
      if (location.pathname.startsWith('/onboarding')) {
        return;
      }
      
      processingRef.current = true;
      setIsCheckingOnboarding(true);
      
      try {
        const needsOnboarding = await checkOnboardingStatus();
        setShouldRedirectToOnboarding(needsOnboarding);
      } catch (error) {
        console.error("❌ Error checking onboarding status:", error);
      } finally {
        setIsCheckingOnboarding(false);
        processingRef.current = false;
        checkPerformedRef.current = true;
      }
    };
    
    checkIfShouldRedirect();
    
    // Reset check flag when location changes
    return () => {
      checkPerformedRef.current = false;
    };
  }, [user, location.pathname, checkOnboardingStatus]);

  // Show loading indicator
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Redirect to onboarding if needed
  if (shouldRedirectToOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // User is authenticated and has completed onboarding
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';
