
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import confetti from 'canvas-confetti';

interface CompleteStepProps {
  completeOnboarding: () => void;
  state: any; // Using any type for simplicity
}

export const CompleteStep: React.FC<CompleteStepProps> = ({ 
  completeOnboarding,
  state 
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti when component mounts
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4F46E5', '#10B981', '#6366F1']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4F46E5', '#10B981', '#6366F1']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  const handleGoToDashboard = async () => {
    // Mark onboarding as complete in database
    await completeOnboarding();
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout 
      currentStep="complete"
      title="Setup Complete! 🎉"
      description="You're all set to start managing your Telegram communities"
      icon={<CheckCircle size={24} />}
      showProgress={false}
    >
      <div className="space-y-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </motion.div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Membify Account is Ready!
          </h2>
          
          <p className="text-gray-600 max-w-md mx-auto">
            You've successfully completed the setup process. Here's what you've accomplished:
          </p>
          
          <ul className="space-y-3 max-w-md mx-auto text-left">
            <li className="flex items-start gap-2 text-gray-700">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                {state.isTelegramConnected 
                  ? "Connected your Telegram group to Membify" 
                  : "Prepared for Telegram group connection"}
              </span>
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                {state.hasPlatformPlan 
                  ? "Selected a platform subscription plan" 
                  : "Set up your platform subscription"}
              </span>
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                {state.hasPaymentMethod 
                  ? "Set up payment method(s) for your subscribers" 
                  : "Added payment options for your subscribers"}
              </span>
            </li>
          </ul>
        </div>
        
        <div className="pt-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              onClick={handleGoToDashboard}
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Sparkles size={16} className="text-yellow-300" />
              Go to Dashboard
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </div>
    </OnboardingLayout>
  );
};
