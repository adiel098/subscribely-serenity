
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AuthForm } from "./AuthForm";
import { AuthFooter } from "./AuthFooter";

interface AuthCardProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

export const AuthCard = ({ isSignUp, setIsSignUp }: AuthCardProps) => {
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

  return (
    <motion.div
      className="w-full max-w-xl"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="glass-card border-2 border-purple-100 shadow-xl w-full">
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
          <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <AuthFooter isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};
