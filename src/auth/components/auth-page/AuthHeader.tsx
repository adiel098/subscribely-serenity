
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AuthHeaderProps {
  isSignUp: boolean;
}

export const AuthHeader = ({ isSignUp }: AuthHeaderProps) => {
  return (
    <motion.div
      className="w-full text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-5xl font-bold mb-3 flex items-center justify-center">
        <Sparkles className="inline-block mr-2 text-indigo-500" size={36} />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Membify
        </span>
        <Sparkles className="inline-block ml-2 text-indigo-500" size={36} />
      </h1>
      <p className="text-lg text-muted-foreground">
        {isSignUp 
          ? "✨ Create your account to start managing your Telegram groups" 
          : "🔐 Sign in to access your dashboard"}
      </p>
    </motion.div>
  );
};
