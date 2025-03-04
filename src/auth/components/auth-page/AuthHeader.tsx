
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AuthHeaderProps {
  isSignUp: boolean;
}

export const AuthHeader = ({ isSignUp }: AuthHeaderProps) => {
  return (
    <motion.div
      className="w-full max-w-xl mb-8 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-5xl font-bold text-primary mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
        <Sparkles className="inline-block mr-2 text-amber-400" size={36} />
        Membify
        <Sparkles className="inline-block ml-2 text-amber-400" size={36} />
      </h1>
      <p className="text-lg text-muted-foreground">
        {isSignUp 
          ? "✨ Create your account to start managing your Telegram groups" 
          : "🔐 Sign in to access your dashboard"}
      </p>
    </motion.div>
  );
};
