
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

/**
 * Signs out the current user and redirects to the auth page
 * @param setLoading Function to update loading state
 * @param setUser Function to update user state
 * @param navigate React Router navigate function
 * @param location Current location from useLocation
 * @param toast Toast notification function
 */
export const handleSignOut = async (
  setLoading: (loading: boolean) => void,
  setUser: (user: null) => void,
  navigate: NavigateFunction,
  currentPath: string,
  toast: any
) => {
  try {
    console.log('🚪 User signing out - executing signOut function');
    setLoading(true);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    } else {
      console.log('✅ Sign out successful');
      
      // Clear user state immediately
      setUser(null);
      
      // Navigate to auth page
      if (currentPath !== '/auth') {
        navigate("/auth", { replace: true });
      }
    }
  } catch (err: any) {
    console.error('❌ Exception during sign out:', err);
    toast({
      variant: "destructive",
      title: "Error signing out",
      description: err?.message || "An unexpected error occurred"
    });
  } finally {
    setLoading(false);
  }
};
