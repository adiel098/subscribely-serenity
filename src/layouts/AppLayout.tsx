
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useAuthRedirect } from "@/auth/hooks/useAuthRedirect";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const { isCheckingAuth } = useAuthRedirect();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  
  // Check onboarding status when user is logged in
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || location.pathname.startsWith('/onboarding')) {
        setIsCheckingOnboarding(false);
        return;
      }
      
      try {
        setIsCheckingOnboarding(true);
        console.log("Checking onboarding status from AppLayout for user:", user.id);
        
        // Check profile to see if onboarding_step is "complete"
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error checking profile:", profileError);
          // Don't redirect if there's an error, just continue with the current page
          setIsCheckingOnboarding(false);
          return;
        }
        
        console.log("Profile onboarding status:", profile);
        
        // Only redirect to onboarding if profile exists and onboarding is not complete
        if (profile && (!profile.onboarding_step || 
            (profile.onboarding_step !== "complete" && !profile.onboarding_completed))) {
          console.log("Onboarding not completed, redirecting to onboarding flow");
          
          let targetPath = '/onboarding/welcome';
          if (profile.onboarding_step) {
            targetPath = `/onboarding/${profile.onboarding_step}`;
          }
          
          console.log(`Redirecting to ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        toast.error("Error checking onboarding status. Please refresh the page.");
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    
    if (!isLoading && user) {
      checkOnboardingStatus();
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [user, isLoading, navigate, location.pathname]);
  
  // Add a small delay before showing content to prevent flickering
  useEffect(() => {
    let mounted = true;
    
    if (!isLoading && !isCheckingAuth && !isCheckingOnboarding) {
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
  }, [isLoading, isCheckingAuth, isCheckingOnboarding, location.pathname]);

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
