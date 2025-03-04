
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthHeader } from "../components/auth-page/AuthHeader";
import { AuthCard } from "../components/auth-page/AuthCard";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();
  
  // Handle redirect logic when user is already authenticated
  useAuthRedirect(user);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl flex flex-col items-center space-y-10">
        <AuthHeader isSignUp={isSignUp} />
        <AuthCard isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>
    </div>
  );
};

export default Auth;
