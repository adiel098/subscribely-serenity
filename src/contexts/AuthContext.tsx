
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  const { toast } = useToast();

  // Check if user is admin and redirect accordingly
  const checkAdminAndRedirect = async (userId: string) => {
    console.log(`🔍 Checking admin status for user ${userId}`);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error checking admin status:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setLoading(false);
        return false;
      }
      
      if (data) {
        console.log(`✅ User ${userId} is an admin with role: ${data.role}`);
        // Delay navigation slightly to ensure state updates have propagated
        setTimeout(() => {
          console.log('🚀 Redirecting to admin dashboard...');
          navigate('/admin/dashboard');
        }, 100);
        return true;
      } else {
        console.log(`ℹ️ User ${userId} is not an admin`);
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('❌ Exception in admin check:', err);
      toast({
        variant: "destructive",
        title: "Error checking admin status",
        description: "Please try refreshing the page"
      });
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    // Add a flag to track if we've already set loading to false
    let loadingHandled = false;

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        console.log('🔄 Checking user session...');
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log(`🔐 User session found for ${currentUser.email}`);
          const isAdmin = await checkAdminAndRedirect(currentUser.id);
          if (!isAdmin && !loadingHandled) {
            console.log('📱 Not an admin, setting loading to false');
            setLoading(false);
            loadingHandled = true;
          }
        } else {
          console.log('⚠️ No user session found');
          if (!loadingHandled) {
            setLoading(false);
            loadingHandled = true;
          }
        }
      } catch (err) {
        console.error('❌ Error checking session:', err);
        if (!loadingHandled) {
          setLoading(false);
          loadingHandled = true;
        }
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Auth state changed: ${event}`);
      setUser(session?.user ?? null);
      
      // If user just signed in, check if they are an admin
      if (event === 'SIGNED_IN' && session?.user) {
        console.log(`👤 User signed in: ${session.user.email}`);
        const isAdmin = await checkAdminAndRedirect(session.user.id);
        if (!isAdmin && !loadingHandled) {
          console.log('📱 Not an admin after sign in, setting loading to false');
          setLoading(false);
          loadingHandled = true;
        }
      } else {
        if (!loadingHandled) {
          console.log('📱 Auth state changed, setting loading to false');
          setLoading(false);
          loadingHandled = true;
        }
      }
    });

    // Set a backup timeout to ensure loading state is cleared if something goes wrong
    const timeoutId = setTimeout(() => {
      if (loading && !loadingHandled) {
        console.log('⚠️ Loading state timeout reached, forcing loading to false');
        setLoading(false);
        loadingHandled = true;
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  const signOut = async () => {
    console.log('🚪 User signing out');
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
