
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if user is admin
      const checkAdminStatus = async () => {
        console.log("🔍 Checking admin status on Auth page...");
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error("❌ Error checking admin status:", error);
            navigate('/dashboard');
            return;
          }
          
          if (data) {
            console.log("✅ User is an admin, redirecting to admin panel");
            navigate('/admin/dashboard');
          } else {
            console.log("ℹ️ Regular user, redirecting to dashboard");
            navigate('/dashboard');
          }
        } catch (err) {
          console.error("❌ Exception in admin status check:", err);
          navigate('/dashboard');
        }
      };
      
      checkAdminStatus();
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log(`🔐 Attempting to sign up user: ${email}`);
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        toast({
          title: "Registration Successful",
          description: "Please check your email for verification.",
        });
        console.log("✅ User registered successfully");
      } else {
        console.log(`🔑 Attempting to sign in user: ${email}`);
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        console.log(`✅ User signed in successfully: ${data.user?.id}`);
        // Redirection will happen in the useEffect above after auth state changes
      }
    } catch (error: any) {
      console.error("❌ Authentication error:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                isSignUp ? "Sign Up" : "Sign In"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-2"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
