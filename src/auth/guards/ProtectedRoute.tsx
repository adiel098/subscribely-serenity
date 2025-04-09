
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useEffect } from "react";
import { localStorageService } from "@/utils/localStorageService";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  children
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (loading) {
      console.log("🔄 ProtectedRoute: Loading authentication state...");
    } else if (user) {
      console.log(`✅ ProtectedRoute: User authenticated: ${user.email}`);
    } else {
      console.log("⚠️ ProtectedRoute: No authenticated user, redirecting to auth page");
    }
  }, [user, loading]);

  // If still loading, show loading screen
  if (loading) {
    console.log("⏳ ProtectedRoute: Still loading, showing loading state");
    return <LoadingScreen />;
  }
  
  // If no authenticated user, redirect to auth page
  if (!user) {
    console.log("🚫 ProtectedRoute: No user, redirecting to auth page");
    // Save the current location so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if we're trying to access the dashboard and need onboarding
  const isDashboardRoute = location.pathname === "/dashboard";
  const onboardingStatus = localStorageService.getOnboardingStatus();
  const hasCommunity = localStorageService.getHasCommunity();
  
  if (isDashboardRoute && (!onboardingStatus?.isCompleted || !hasCommunity)) {
    console.log("🔄 ProtectedRoute: Redirecting to onboarding from dashboard");
    return <Navigate to="/onboarding" replace />;
  }

  // If we're trying to access onboarding but it's completed and we have a community
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");
  if (isOnboardingRoute && onboardingStatus?.isCompleted && hasCommunity) {
    console.log("✅ ProtectedRoute: Onboarding complete, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
