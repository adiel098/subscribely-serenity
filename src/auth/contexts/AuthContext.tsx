
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { AuthContextType } from "../types/authTypes";
import { useCheckAdminStatus } from "../hooks/useCheckAdminStatus";
import { handleSignOut } from "../utils/authActions";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { checkAdminStatus } = useCheckAdminStatus();

  useEffect(() => {
    let mounted = true;
    
    // Check active sessions and set the user
    const checkSession = async () => {
      try {
        console.log('🔄 AuthContext: Checking user session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log(`🔐 AuthContext: User session found for ${session.user.email}`);
          setUser(session.user);
        } else {
          console.log('⚠️ AuthContext: No user session found');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ AuthContext: Error checking session:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 AuthContext: Auth state changed: ${event}`);
      
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 AuthContext: User signed out');
        setUser(null);
        setLoading(false);
        
        // Only redirect to auth page if not already there
        if (location.pathname !== '/auth') {
          console.log('🚀 AuthContext: Redirecting to auth page after sign out');
          navigate("/auth", { replace: true });
        }
        return;
      }
      
      if (session?.user) {
        console.log(`👤 AuthContext: User session updated: ${session.user.email}`);
        setUser(session.user);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Set a backup timeout to ensure loading state is cleared if something goes wrong
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⚠️ AuthContext: Loading state timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate, location.pathname]);

  const signOut = async () => {
    await handleSignOut(
      setLoading,
      setUser,
      navigate,
      location.pathname,
      toast
    );
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
