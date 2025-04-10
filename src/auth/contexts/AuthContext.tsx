
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add extra console logs for debugging
  const logMessage = (message: string, data?: any) => {
    console.log(message, data ? data : '');
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      setIsLoading(true);
      logMessage("AuthContext: Checking user session...");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logMessage("❌ AuthContext: Error fetching session:", error);
        }
        
        if (session?.user) {
          logMessage(`🔐 AuthContext: User session found for ${session.user.email}`);
          updateUserState(session);
        } else {
          logMessage("⚠️ AuthContext: No user session found");
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        logMessage("❌ AuthContext: Exception in getSession:", err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logMessage(`🔄 AuthContext: Auth state changed: ${event}`);
        updateUserState(session);
      }
    );

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        logMessage("⚠️ AuthContext: Loading state timeout reached, forcing loading to false");
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Separate function to update user state to avoid duplication
  const updateUserState = (session: Session | null) => {
    if (session?.user) {
      logMessage(`👤 AuthContext: User session updated: ${session.user.email}`);
      setUser(session.user);
      setSession(session);
    } else {
      logMessage("🔄 AuthContext: Clearing user session");
      setUser(null);
      setSession(null);
    }
    setIsLoading(false);
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    logMessage(`🔐 AuthContext: Signing in with email: ${email}`);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logMessage(`❌ AuthContext: Sign in error:`, error);
        throw error;
      }
      
      logMessage(`✅ AuthContext: Sign in successful`);
    } catch (error) {
      setIsLoading(false);
      logMessage(`❌ AuthContext: Sign in exception:`, error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    logMessage(`📝 AuthContext: Creating account for: ${email}`);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        logMessage(`❌ AuthContext: Sign up error:`, error);
        setIsLoading(false);
        throw error;
      }
      
      logMessage(`✅ AuthContext: Account created successfully`);
    } catch (error) {
      setIsLoading(false);
      logMessage(`❌ AuthContext: Sign up exception:`, error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    logMessage(`🚪 AuthContext: Signing out user`);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logMessage(`❌ AuthContext: Sign out error:`, error);
        setIsLoading(false);
        throw error;
      }
      logMessage(`✅ AuthContext: Sign out successful`);
    } catch (error) {
      setIsLoading(false);
      logMessage(`❌ AuthContext: Sign out exception:`, error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
