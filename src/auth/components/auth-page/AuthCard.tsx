
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
      className="w-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="glassmorphism border-2 border-indigo-100 shadow-xl w-full">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-indigo-900">
            {isSignUp ? "✨ Create Account" : "👋 Welcome Back"}
          </CardTitle>
          <CardDescription className="text-indigo-600">
            {isSignUp 
              ? "Enter your details to create an account" 
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <AuthFooter isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};
