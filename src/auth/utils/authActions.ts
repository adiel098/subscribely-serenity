
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
    
    // Immediately clear user state to update UI
    setUser(null);
    
    // Clear all browser storage
    sessionStorage.clear();
    localStorage.clear();
    
    // Clear all cookies related to authentication
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    console.log("✅ AuthActions: Local storage and cookies cleared");
    
    // Then attempt to sign out from Supabase
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.warn("⚠️ AuthActions: Supabase signOut returned error:", error);
      // We'll continue the logout flow even if there's an error from Supabase
    } else {
      console.log("✅ AuthActions: Supabase signOut successful");
    }
    
    // Only redirect to auth page if not already there
    if (currentPath !== '/auth') {
      console.log("🔄 AuthActions: Redirecting to auth page");
      navigate("/auth", { replace: true });
    }
    
    toast({
      title: "Successfully signed out",
      description: "You have been signed out from your account."
    });
  } catch (error) {
    console.error("❌ AuthActions: Error during sign out process:", error);
    
    // Even if there's an error, ensure we clean up the session
    setUser(null);
    sessionStorage.clear();
    localStorage.clear();
    
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
