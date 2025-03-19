
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      // Skip onboarding check if already in the onboarding flow
      if (location.pathname.startsWith('/onboarding')) return;
      
      try {
        // First check if user has any communities
        const { data: communities, error: communitiesError } = await supabase
          .from('communities')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);
        
        if (communitiesError) throw communitiesError;
        
        // If user has communities, no need for onboarding
        if (communities && communities.length > 0) {
          console.log("User has communities, no onboarding needed");
          // If on login page, redirect to dashboard
          if (location.pathname.startsWith('/auth')) {
            navigate('/dashboard');
          }
          return;
        }
        
        // Check onboarding status only if user has no communities
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // If onboarding isn't completed, redirect to onboarding
        if (!profile.onboarding_completed) {
          // If user has a specific step in progress, redirect to that step
          if (profile.onboarding_step && profile.onboarding_step !== 'welcome') {
            navigate(`/onboarding/${profile.onboarding_step}`);
          } else {
            navigate('/onboarding/welcome');
          }
        } else if (location.pathname.startsWith('/auth')) {
          // If onboarding is completed and user is on auth page, redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };
    
    if (!isLoading) {
      // If user is not logged in and tries to access protected routes
      if (!user && !location.pathname.startsWith('/auth')) {
        navigate('/auth/login');
      } 
      // If user is logged in
      else if (user) {
        // Check onboarding status when user logs in or navigates to a new page
        checkOnboardingStatus();
        
        // If user tries to access auth pages while logged in
        if (location.pathname.startsWith('/auth')) {
          navigate('/dashboard');
        }
      }
    }
  }, [user, isLoading, navigate, location.pathname]);
}
