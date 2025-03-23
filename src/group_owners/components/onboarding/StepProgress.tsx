
import React from "react";
import { motion } from "framer-motion";
import { Check, Rocket, Users, Bot, Shield, Zap } from "lucide-react";
import { OnboardingStep, ONBOARDING_STEPS } from "@/group_owners/hooks/onboarding/types";

interface StepProgressProps {
  currentStep: OnboardingStep;
}

interface StepInfo {
  title: string;
  icon: React.ReactNode;
}

const STEP_INFO: Record<OnboardingStep, StepInfo> = {
  'welcome': {
    title: 'Welcome',
    icon: <Rocket className="h-4 w-4" />
  },
  'bot-selection': {
    title: 'Choose Bot',
    icon: <Bot className="h-4 w-4" />
  },
  'custom-bot-setup': {
    title: 'Setup Bot',
    icon: <Shield className="h-4 w-4" />
  },
  'official-bot-setup': {
    title: 'Official Bot',
    icon: <Zap className="h-4 w-4" />
  },
  'connect-telegram': {
    title: 'Connect',
    icon: <Users className="h-4 w-4" />
  },
  'complete': {
    title: 'Complete',
    icon: <Check className="h-4 w-4" />
  }
};

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {ONBOARDING_STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isLast = index === ONBOARDING_STEPS.length - 1;
          
          return (
            <React.Fragment key={step}>
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.1 * index, 
                  duration: 0.4,
                  type: isActive ? "spring" : "tween",
                  stiffness: isActive ? 300 : 100
                }}
              >
                <motion.div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                  animate={isActive ? { 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0px 0px 0px 0px rgba(79, 70, 229, 0.3)",
                      "0px 0px 0px 4px rgba(79, 70, 229, 0.3)",
                      "0px 0px 0px 0px rgba(79, 70, 229, 0.3)"
                    ]
                  } : {}}
                  transition={{ 
                    repeat: isActive ? Infinity : 0, 
                    duration: 2
                  }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ rotate: 0, scale: 0 }}
                      animate={{ rotate: 360, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={isActive ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, 0, -5, 0]
                      } : {}}
                      transition={{ 
                        duration: isActive ? 0.8 : 0,
                        delay: 0.3,
                        repeat: isActive ? 1 : 0
                      }}
                    >
                      {STEP_INFO[step].icon}
                    </motion.div>
                  )}
                </motion.div>
                <motion.span 
                  className={`text-xs mt-2 ${
                    isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'
                  }`}
                  animate={isActive ? { 
                    y: [0, -2, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {STEP_INFO[step].title}
                </motion.span>
              </motion.div>
              
              {!isLast && (
                <motion.div 
                  className={`h-1 flex-1 mx-2 ${
                    index < currentIndex ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
