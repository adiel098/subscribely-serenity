
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
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear user state
    setUser(null);
    
    // Clear cached session
    sessionStorage.removeItem('cached_user_session');
    
    // Only redirect to auth page if not already there
    if (currentPath !== '/auth') {
      navigate("/auth", { replace: true });
    }
    
    toast({
      title: "Successfully signed out",
      description: "You have been signed out from your account."
    });
  } catch (error) {
    console.error("Error signing out:", error);
    toast({
      title: "Sign out failed",
      description: "There was an error signing out. Please try again.",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};
