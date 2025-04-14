
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/hooks/useAuth";
import { useEffect, useState, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useOnboardingStatus } from "@/group_owners/hooks/useOnboardingStatus";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute - Ensures that only authenticated users can access certain routes
 * If a user tries to access a protected route without being logged in, they are redirected to the login page
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);
  const { checkOnboardingStatus } = useOnboardingStatus();
  const checkPerformedRef = useRef(false);
  const processingRef = useRef(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce loading state changes to prevent rapid UI flickering
  const [stableLoading, setStableLoading] = useState(true);
  
  // Use a stable loading state with debounce
  useEffect(() => {
    if (!loading && !isCheckingOnboarding) {
      // Clear any pending timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      // Short delay before removing loading state to prevent flicker
      loadingTimerRef.current = setTimeout(() => {
        setStableLoading(false);
      }, 300);
    } else {
      setStableLoading(true);
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [loading, isCheckingOnboarding]);

  useEffect(() => {
    // Prevent concurrent processing
    if (processingRef.current) return;
    processingRef.current = true;
    
    // Only check onboarding status once per route change
    const checkIfShouldRedirect = async () => {
      if (user && !location.pathname.startsWith('/onboarding') && !checkPerformedRef.current) {
        checkPerformedRef.current = true;
        setIsCheckingOnboarding(true);
        
        try {
          const needsOnboarding = await checkOnboardingStatus();
          setShouldRedirectToOnboarding(needsOnboarding);
        } catch (error) {
          console.error("❌ Error checking onboarding status:", error);
        } finally {
          setIsCheckingOnboarding(false);
          processingRef.current = false;
        }
      } else {
        processingRef.current = false;
      }
    };
    
    checkIfShouldRedirect();
    
    // Reset check flag when location changes
    return () => {
      checkPerformedRef.current = false;
    };
  }, [user, location.pathname, checkOnboardingStatus]);

  if (stableLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
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
};
