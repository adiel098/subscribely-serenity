
import React from "react";
import { Check, Rocket, Users, CreditCard, Zap } from "lucide-react";
import { OnboardingStep, ONBOARDING_STEPS } from "@/group_owners/hooks/useOnboarding";

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
  'connect-telegram': {
    title: 'Connect Telegram',
    icon: <Users className="h-4 w-4" />
  },
  'platform-plan': {
    title: 'Choose Plan',
    icon: <Zap className="h-4 w-4" />
  },
  'payment-method': {
    title: 'Payment Method',
    icon: <CreditCard className="h-4 w-4" />
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
              <div className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  } transition-colors duration-300`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    STEP_INFO[step].icon
                  )}
                </div>
                <span className={`text-xs mt-2 ${
                  isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'
                }`}>
                  {STEP_INFO[step].title}
                </span>
              </div>
              
              {!isLast && (
                <div 
                  className={`h-1 flex-1 mx-2 ${
                    index < currentIndex ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
