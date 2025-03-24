import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
interface AuthFooterProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}
export const AuthFooter = ({
  isSignUp,
  setIsSignUp
}: AuthFooterProps) => {
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    delay: 0.4,
    duration: 0.5
  }} className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-indigo-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button variant="outline" onClick={() => setIsSignUp(!isSignUp)} className="mt-4 w-full hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 border-indigo-200 flex items-center justify-center gap-2">
        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>;
};