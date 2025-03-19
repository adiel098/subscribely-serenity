
import React from "react";
import { motion } from "framer-motion";
import { StepProgress } from "./StepProgress";
import { OnboardingStep } from "@/group_owners/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4 relative">
      {/* Logout Button in the top-right corner with red text */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </Button>

      <div className="w-full max-w-3xl">
        {showProgress && (
          <div className="mb-8">
            <StepProgress currentStep={currentStep} />
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              {icon && <div className="text-indigo-600">{icon}</div>}
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            <p className="text-gray-600">{description}</p>
          </div>
          
          <div className="p-8">
            {children}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-sm text-gray-500"
        >
          <p>Need help? Contact support at support@membify.app</p>
        </motion.div>
      </div>
    </div>
  );
};
