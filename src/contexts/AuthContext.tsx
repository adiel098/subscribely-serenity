
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
        return false;
      }
      
      if (data) {
        console.log(`✅ User ${userId} is an admin with role: ${data.role}`);
        navigate('/admin/dashboard');
        return true;
      } else {
        console.log(`ℹ️ User ${userId} is not an admin`);
        return false;
      }
    } catch (err) {
      console.error('❌ Exception in admin check:', err);
      return false;
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log(`🔐 User session found for ${currentUser.email}`);
        checkAdminAndRedirect(currentUser.id);
      } else {
        console.log('⚠️ No user session found');
      }
      
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Auth state changed: ${event}`);
      setUser(session?.user ?? null);
      
      // If user just signed in, check if they are an admin
      if (event === 'SIGNED_IN' && session?.user) {
        console.log(`👤 User signed in: ${session.user.email}`);
        await checkAdminAndRedirect(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
