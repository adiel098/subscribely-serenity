
import React from "react";
import { motion } from "framer-motion";
import { StepProgress } from "./StepProgress";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/auth/contexts/AuthContext";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: OnboardingStep;
  title: string;
  description: string;
  icon?: React.ReactNode;
  showProgress?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  title,
  description,
  icon,
  showProgress = true,
  onBack,
  showBackButton = false
}) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4 relative">
      {/* Logout Button in the top-right corner with red text */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="absolute top-4 right-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </motion.div>

      <div className="w-full max-w-3xl mx-auto">
        {showProgress && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <StepProgress currentStep={currentStep} />
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="p-8 border-b border-gray-100"
          >
            <motion.div 
              className="flex items-center gap-3 mb-2"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {icon && <div className="text-indigo-600">{icon}</div>}
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </motion.div>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {description}
            </motion.p>
          </motion.div>
          
          <div className="p-8">
            {children}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-center text-sm text-gray-500"
        >
          <p>Need help? Contact support at support@membify.app</p>
        </motion.div>
      </div>
    </div>
  );
};
