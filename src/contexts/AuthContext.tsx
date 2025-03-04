
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
      // Use RPC to check admin status
      console.log(`📊 Using is_admin RPC for user_id: ${userId}`);
      
      const { data, error } = await supabase
        .rpc('is_admin', { user_uuid: userId });
      
      if (error) {
        console.error('❌ Error checking admin status with RPC:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        // Try fallback with direct select
        console.log('🔄 Trying fallback admin check method...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', userId)
          .limit(1);
        
        if (fallbackError) {
          console.error('❌ Fallback admin check also failed:', fallbackError);
          console.error('❌ Error details:', JSON.stringify(fallbackError, null, 2));
          setLoading(false);
          return false;
        }
        
        console.log(`📋 Admin fallback check result:`, fallbackData);
        
        if (fallbackData && fallbackData.length > 0) {
          console.log(`✅ User ${userId} is an admin with role: ${fallbackData[0].role}`);
          
          // Get current URL path to avoid unnecessary navigation
          const currentPath = window.location.pathname;
          console.log(`🔍 Current path: ${currentPath}`);
          
          if (!currentPath.startsWith('/admin')) {
            console.log('🚀 Redirecting to admin dashboard...');
            navigate('/admin/dashboard');
          }
          
          setLoading(false);
          return true;
        } else {
          console.log(`ℹ️ User ${userId} is not an admin`);
          setLoading(false);
          return false;
        }
      } else {
        const isAdmin = !!data;
        console.log(`📋 Admin RPC check result: ${isAdmin}`);
        
        if (isAdmin) {
          console.log(`✅ User ${userId} is an admin`);
          
          // Get current URL path to avoid unnecessary navigation
          const currentPath = window.location.pathname;
          console.log(`🔍 Current path: ${currentPath}`);
          
          if (!currentPath.startsWith('/admin')) {
            console.log('🚀 Redirecting to admin dashboard...');
            navigate('/admin/dashboard');
          }
        } else {
          console.log(`ℹ️ User ${userId} is not an admin`);
        }
        
        setLoading(false);
        return isAdmin;
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
        console.log('📋 Session data:', session ? `User ID: ${session.user.id}` : 'No session');
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log(`🔐 User session found for ${currentUser.email}`);
          await checkAdminAndRedirect(currentUser.id);
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
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        if (!loadingHandled) {
          setLoading(false);
          loadingHandled = true;
        }
        // Force navigation to auth page on sign out
        navigate("/auth");
        return;
      }
      
      setUser(session?.user ?? null);
      
      // If user just signed in, check if they are an admin
      if (event === 'SIGNED_IN' && session?.user) {
        console.log(`👤 User signed in: ${session.user.email}`);
        await checkAdminAndRedirect(session.user.id);
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
    try {
      console.log('🚪 User signing out - executing signOut function');
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
        // Clear user state immediately (don't wait for auth state listener)
        setUser(null);
        // Force navigation to auth page on sign out
        navigate("/auth");
      }
    } catch (err: any) {
      console.error('❌ Exception during sign out:', err);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: err?.message || "An unexpected error occurred"
      });
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
