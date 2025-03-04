
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Checks if a user exists by email
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error && error.message.includes("User not found")) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};

/**
 * Handles sign-out with error notifications
 */
export const handleSignOut = async (navigate: (path: string) => void) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
      return false;
    }
    
    navigate("/auth");
    return true;
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Sign out failed",
      description: error.message || "An unexpected error occurred",
    });
    return false;
  }
};

/**
 * Extracts user profile data from Supabase session
 */
export const getUserProfile = (user: any) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatarUrl: user.user_metadata?.avatar_url || null,
  };
};
