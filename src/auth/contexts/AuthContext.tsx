
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
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
  const authInitializedRef = useRef(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Memoize state updates to prevent redundant renders
  const updateUserState = useCallback((newUser: User | null, newSession: Session | null) => {
    // Only update if user ID has changed to avoid endless re-renders
    const newUserId = newUser?.id || null;
    if (newUserId !== userIdRef.current) {
      userIdRef.current = newUserId;
      setUser(newUser);
      setSession(newSession);
      
      if (isLoading) {
        setIsLoading(false);
      }
    } else if (isLoading && authInitializedRef.current) {
      // If loading but auth is initialized, we should exit loading state
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (authInitializedRef.current) return;
    authInitializedRef.current = true;
    
    // Get initial session
    const initAuth = async () => {
      setIsLoading(true);
      console.log("AuthContext: Checking user session...");
      
      try {
        // First set up auth state listener to avoid race conditions
        if (!subscriptionRef.current) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log(`🔄 AuthContext: Auth state changed: ${event}`);
            updateUserState(newSession?.user || null, newSession);
          });
          
          subscriptionRef.current = subscription;
        }

        // Then check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          console.log(`🔐 AuthContext: User session found for ${initialSession.user.email}`);
          updateUserState(initialSession.user, initialSession);
        } else {
          console.log("AuthContext: No user session found");
          updateUserState(null, null);
        }
      } catch (err) {
        console.error("AuthContext: Exception in getSession:", err);
        updateUserState(null, null);
      }
    };

    initAuth();

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ AuthContext: Loading state timeout reached, forcing loading to false");
        setIsLoading(false);
      }
    }, 3000);

    // Clean up subscription and timeout
    return () => {
      clearTimeout(timeout);
      subscriptionRef.current?.unsubscribe();
    };
  }, [updateUserState, isLoading]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log(`🔐 AuthContext: Signing in with email: ${email}`);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(`❌ AuthContext: Sign in error:`, error);
        setIsLoading(false);
        throw error;
      }
      
      console.log(`✅ AuthContext: Sign in successful`);
      // Loading state will be updated by the auth state change listener
    } catch (error) {
      setIsLoading(false);
      console.log(`❌ AuthContext: Sign in exception:`, error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    console.log(`📝 AuthContext: Creating account for: ${email}`);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log(`❌ AuthContext: Sign up error:`, error);
        setIsLoading(false);
        throw error;
      }
      
      console.log(`✅ AuthContext: Account created successfully`);
      // Loading state will be updated by the auth state change listener
    } catch (error) {
      setIsLoading(false);
      console.log(`❌ AuthContext: Sign up exception:`, error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    console.log(`🚪 AuthContext: Signing out user`);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log(`❌ AuthContext: Sign out error:`, error);
        setIsLoading(false);
        throw error;
      }
      console.log(`✅ AuthContext: Sign out successful`);
      // Loading state will be updated by the auth state change listener
    } catch (error) {
      setIsLoading(false);
      console.log(`❌ AuthContext: Sign out exception:`, error);
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
