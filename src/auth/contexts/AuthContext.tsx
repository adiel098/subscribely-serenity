
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

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

  // Check if user is admin
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;
    
    console.log(`🔍 AuthContext: Checking admin status for user ${userId}`);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ AuthContext: Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('❌ AuthContext: Exception in admin check:', err);
      return false;
    }
  };

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
        if (location.pathname !== '/auth') {
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

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
