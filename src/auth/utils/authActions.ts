
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Define an interface for the handleSignOut parameters
interface SignOutParams {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  navigate: NavigateFunction;
  currentPath: string;
  toast: any;
}

export const handleSignOut = async ({
  setLoading,
  setUser,
  navigate,
  currentPath,
  toast
}: SignOutParams) => {
  try {
    setLoading(true);
    
    // Clear cached session first before attempting to sign out
    sessionStorage.removeItem('cached_user_session');
    
    // Clear user state before the API call
    setUser(null);
    
    // Attempt to sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.warn("Supabase signOut returned error, but continuing logout flow:", error);
      // We'll continue the logout flow even if there's an error from Supabase
      // since we've already cleared the local session
    }
    
    // Only redirect to auth page if not already there
    if (currentPath !== '/auth') {
      navigate("/auth", { replace: true });
    }
    
    toast({
      title: "Successfully signed out",
      description: "You have been signed out from your account."
    });
  } catch (error) {
    console.error("Error during sign out process:", error);
    
    // Even if there's an error, we still want to try to clean up the session
    setUser(null);
    sessionStorage.removeItem('cached_user_session');
    
    // Force navigation to auth page
    if (currentPath !== '/auth') {
      navigate("/auth", { replace: true });
    }
    
    toast({
      title: "Sign out completed",
      description: "You have been signed out from your account, although there were some issues in the process."
    });
  } finally {
    setLoading(false);
  }
};
