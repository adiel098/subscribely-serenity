
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Loader2, Mail, Key, LogIn, UserPlus, ArrowRight, Sparkles } from "lucide-react";
import { useCheckAdminStatus } from "../hooks/useCheckAdminStatus";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkAdminStatus } = useCheckAdminStatus();

  useEffect(() => {
    if (user) {
      console.log("✅ Auth page: User detected, preparing to redirect", user.email);
      
      // Add a slight delay before checking admin status to ensure auth state is fully updated
      const redirectTimer = setTimeout(async () => {
        try {
          console.log("🔍 Auth page: Checking admin status for", user.id);
          const isAdmin = await checkAdminStatus(user.id);
          
          if (isAdmin) {
            console.log("✅ Auth page: Admin user confirmed, redirecting to admin dashboard");
            return navigate('/admin/dashboard', { replace: true });
          } else {
            console.log("ℹ️ Auth page: Regular user confirmed, redirecting to dashboard");
            return navigate('/dashboard', { replace: true });
          }
        } catch (err) {
          console.error("❌ Auth page: Exception in admin check:", err);
          console.log("🚀 Auth page: Redirecting to dashboard due to exception");
          return navigate('/dashboard', { replace: true });
        }
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, checkAdminStatus]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log(`🔐 Auth page: Attempting to sign up user: ${email}`);
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        toast({
          title: "Registration Successful",
          description: "Please check your email for verification.",
        });
        console.log("✅ Auth page: User registered successfully");
      } else {
        console.log(`🔑 Auth page: Attempting to sign in user: ${email}`);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast({
          title: "Login Successful",
          description: "You are now logged in.",
        });
      }
    } catch (error: any) {
      console.error("❌ Auth page: Authentication error:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.4
      }
    })
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary mb-2">
          <Sparkles className="inline-block mr-2 text-amber-400" size={32} />
          {isSignUp ? "Join Our Platform" : "Welcome Back"} 
          <Sparkles className="inline-block ml-2 text-amber-400" size={32} />
        </h1>
        <p className="text-lg text-muted-foreground">
          {isSignUp 
            ? "✨ Create your account to start managing your Telegram groups" 
            : "🔐 Sign in to access your dashboard"}
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-md"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="glass-card border-2 border-purple-100 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isSignUp ? "✨ Sign Up" : "👋 Sign In"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Enter your details to create an account" 
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <motion.div
                    variants={inputVariants}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    className="relative"
                  >
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                      placeholder="you@example.com"
                    />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <motion.div
                    variants={inputVariants}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    className="relative"
                  >
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                      placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                    />
                  </motion.div>
                </div>
              </div>

              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isSignUp ? (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" /> Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" /> Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-purple-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsSignUp(!isSignUp)}
                className="mt-4 w-full hover:bg-purple-50 transition-all duration-200"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
