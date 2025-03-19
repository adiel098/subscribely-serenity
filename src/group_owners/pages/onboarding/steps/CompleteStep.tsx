
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import confetti from 'canvas-confetti';

interface CompleteStepProps {
  completeOnboarding: () => void;
  goToPreviousStep: () => void;
  state: any; // Using any type for simplicity
}

export const CompleteStep: React.FC<CompleteStepProps> = ({ 
  completeOnboarding,
  goToPreviousStep,
  state 
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti when component mounts
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4F46E5', '#10B981', '#6366F1', '#EC4899']
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4F46E5', '#10B981', '#6366F1', '#EC4899']
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

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <OnboardingLayout 
      currentStep="complete"
      title="Setup Complete! 🎉"
      description="You're all set to start managing your Telegram communities"
      icon={<CheckCircle size={24} />}
      showProgress={false}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <motion.div 
        className="space-y-8 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            type: "spring", 
            stiffness: 200,
            damping: 15
          }}
          className="flex justify-center"
        >
          <motion.div 
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0px 0px 0px 0px rgba(16, 185, 129, 0.1)", 
                "0px 0px 0px 15px rgba(16, 185, 129, 0.1)", 
                "0px 0px 0px 0px rgba(16, 185, 129, 0.1)"
              ]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <CheckCircle size={48} className="text-green-600" />
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-4" variants={item}>
          <motion.h2 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Your Membify Account is Ready!
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            You've successfully completed the setup process. Here's what you've accomplished:
          </motion.p>
          
          <motion.ul className="space-y-3 max-w-md mx-auto text-left">
            <motion.li 
              className="flex items-start gap-2 text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0, -10, 0] 
                }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              </motion.div>
              <span>
                {state.isTelegramConnected 
                  ? "Connected your Telegram group to Membify" 
                  : "Prepared for Telegram group connection"}
              </span>
            </motion.li>
            <motion.li 
              className="flex items-start gap-2 text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0, -10, 0] 
                }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              </motion.div>
              <span>
                {state.hasPlatformPlan 
                  ? "Selected a platform subscription plan" 
                  : "Set up your platform subscription"}
              </span>
            </motion.li>
            <motion.li 
              className="flex items-start gap-2 text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0, -10, 0] 
                }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              </motion.div>
              <span>
                {state.hasPaymentMethod 
                  ? "Set up payment method(s) for your subscribers" 
                  : "Added payment options for your subscribers"}
              </span>
            </motion.li>
          </motion.ul>
        </motion.div>
        
        <div className="pt-6 flex justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 1.5, 
              duration: 0.5,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0px 5px 15px rgba(79, 70, 229, 0.2)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleGoToDashboard}
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 20, 0, -20, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  delay: 2, 
                  duration: 0.7,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles size={16} className="text-yellow-300" />
              </motion.div>
              Go to Dashboard
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};
