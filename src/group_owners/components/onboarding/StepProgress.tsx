
import React from "react";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { motion } from "framer-motion";
import { Bot, Rocket, FolderPlus, CheckCircle } from "lucide-react";

interface StepProgressProps {
  currentStep: OnboardingStep;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: "welcome", label: "Welcome", icon: <Rocket size={18} /> },
    { id: "project-creation", label: "Project", icon: <FolderPlus size={18} /> },
    { id: "custom-bot-setup", label: "Bot Setup", icon: <Bot size={18} /> },
    { id: "completion", label: "Complete", icon: <CheckCircle size={18} /> },
  ];

  // Determine current step index
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const lastStepIndex = steps.length - 1;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 relative">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute h-1 bg-gray-200 top-1/2 left-0 right-0 -translate-y-1/2 z-0"></div>
        
        {/* Completed Line */}
        <motion.div 
          className="absolute h-1 bg-gradient-to-r from-indigo-500 to-purple-500 top-1/2 left-0 -translate-y-1/2 z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: currentIndex === 0 ? 0.01 : 
                   currentIndex === lastStepIndex ? 1 : 
                   (currentIndex) / (steps.length - 1)
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        ></motion.div>
        
        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPassed = index < currentIndex;
          const isFuture = index > currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center justify-center z-10 relative">
              {/* Step Circle */}
              <motion.div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-1
                  ${isPassed ? "bg-gradient-to-r from-indigo-500 to-purple-500" :
                    isActive ? "bg-gradient-to-r from-blue-500 to-indigo-500 ring-4 ring-indigo-100" :
                    "bg-gray-200 text-gray-500"}`}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive ? "0 0 0 4px rgba(99, 102, 241, 0.2)" : "none" 
                }}
                transition={{ duration: 0.3 }}
              >
                {step.icon}
              </motion.div>
              
              {/* Step Label */}
              <motion.span
                className={`text-xs font-medium mt-1
                  ${isPassed ? "text-indigo-600" : 
                    isActive ? "text-gray-900" : 
                    "text-gray-400"}`}
                animate={{ fontWeight: isActive ? 600 : 500 }}
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
