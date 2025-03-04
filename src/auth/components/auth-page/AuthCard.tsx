
import { AuthFooter } from "./AuthFooter";
import { AuthForm } from "./AuthForm";
import { motion } from "framer-motion";

interface AuthCardProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

export const AuthCard = ({ isSignUp, setIsSignUp }: AuthCardProps) => {
  return (
    <motion.div
      className="w-full bg-white shadow-lg rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 sm:p-8">
        <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        <AuthFooter isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>
    </motion.div>
  );
};
