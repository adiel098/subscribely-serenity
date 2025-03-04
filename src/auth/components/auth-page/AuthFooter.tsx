
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AuthFooterProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

export const AuthFooter = ({ isSignUp, setIsSignUp }: AuthFooterProps) => {
  return (
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
  );
};
