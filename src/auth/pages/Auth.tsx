
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthHeader } from "../components/auth-page/AuthHeader";
import { AuthCard } from "../components/auth-page/AuthCard";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { motion } from "framer-motion";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();
  
  // Handle redirect logic when user is already authenticated
  useAuthRedirect();

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background with gradient and animated shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 z-0">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-indigo-300/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 15, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-32 w-96 h-96 rounded-full bg-purple-300/30 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, -15, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>

      {/* Main content */}
      <div className="w-full max-w-xl flex flex-col items-center space-y-10 px-4 z-10">
        <AuthHeader isSignUp={isSignUp} />
        <AuthCard isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>
    </div>
  );
};

export default Auth;
