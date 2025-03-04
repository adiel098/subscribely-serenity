
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
      // Use RPC to check admin status to avoid RLS recursion issues
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
          setLoading(false);
          return false;
        }
        
        console.log(`📋 Admin fallback check result:`, JSON.stringify(fallbackData, null, 2));
        
        if (fallbackData && fallbackData.length > 0) {
          const isAdmin = true;
          const role = fallbackData[0].role;
          console.log(`✅ User ${userId} is an admin with role: ${role}`);
          
          // Get current URL path to avoid unnecessary navigation
          const currentPath = window.location.pathname;
          console.log(`🔍 Current path: ${currentPath}`);
          
          if (!currentPath.startsWith('/admin')) {
            console.log('🚀 Redirecting to admin dashboard...');
            navigate('/admin/dashboard');
          } else {
            console.log('ℹ️ Already on admin path, not redirecting');
          }
          
          // IMPORTANT: Set loading to false for admin users too
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
          } else {
            console.log('ℹ️ Already on admin path, not redirecting');
          }
        } else {
          console.log(`ℹ️ User ${userId} is not an admin`);
        }
        
        // IMPORTANT: Set loading to false for admin users too
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
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log(`🔐 User session found for ${currentUser.email}`);
          const isAdmin = await checkAdminAndRedirect(currentUser.id);
          // Note: checkAdminAndRedirect sets loading to false for both admin and non-admin users
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
