import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Key, LogIn, UserPlus, ArrowRight, User } from "lucide-react";

interface AuthFormProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

export const AuthForm = ({ isSignUp, setIsSignUp }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log(`🔐 Auth page: Starting registration process for email: ${email}`);
        
        // שלב 1: יצירת משתמש בטבלת האימות של Supabase
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim()
            }
          }
        });

        if (error) {
          console.error("❌ Auth page: Supabase auth signup failed:", error);
          throw error;
        }

        console.log("✅ Auth page: Supabase auth signup successful");

        // שלב 2: עדכון פרטי המשתמש בטבלת users
        if (authData.user) {
          const now = new Date().toISOString();
          console.log(`📝 Auth page: Updating user record in users table for ID: ${authData.user.id}`);
          
          const { error: userError } = await supabase
            .from('users')
            .update({
              email: authData.user.email,
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              status: 'active',
              registration_date: now,
              updated_at: now,
              last_login: now,
              onboarding_completed: false,
              onboarding_step: 'welcome'
            })
            .eq('id', authData.user.id);

          if (userError) {
            console.error("❌ Auth page: Failed to update user record:", userError);
            // נרשום את השגיאה המלאה לצורכי דיבוג
            console.error("Error details:", {
              code: userError.code,
              message: userError.message,
              details: userError.details,
              hint: userError.hint
            });
            
            toast({
              variant: "destructive",
              title: "Registration Error",
              description: "Failed to complete user registration. Our team has been notified.",
            });
            return;
          }

          console.log("✅ Auth page: User record updated successfully");
        }
        
        toast({
          title: "Welcome to Subscribely!",
          description: "Please check your email to verify your account.",
        });
        console.log("🎉 Auth page: Registration process completed successfully");
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
    <form className="space-y-6" onSubmit={handleAuth}>
      <div className="space-y-4">
        {isSignUp && (
          <>
            <div className="space-y-2">
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="relative"
              >
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required={isSignUp}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                  placeholder="Your first name"
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
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required={isSignUp}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                  placeholder="Your last name"
                />
              </motion.div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            custom={isSignUp ? 3 : 1}
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
            custom={isSignUp ? 4 : 2}
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
        custom={isSignUp ? 5 : 3}
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
  );
};
