
import React from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowLeft, Gauge, CreditCard, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";

interface CompletionStepProps {
  onComplete: () => Promise<void>;
  goToPreviousStep: () => void;
  activeStep: boolean;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ 
  onComplete, 
  goToPreviousStep,
  activeStep 
}) => {
  const navigate = useNavigate();
  const [isConfettiTriggered, setIsConfettiTriggered] = React.useState(false);

  React.useEffect(() => {
    if (!isConfettiTriggered) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setIsConfettiTriggered(true);
    }
  }, [isConfettiTriggered]);

  const handleCompleteOnboarding = async () => {
    try {
      await onComplete();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const nextSteps = [
    {
      title: "Create Subscription Plans",
      description: "Set up pricing plans for your community",
      icon: <CreditCard className="h-5 w-5 text-indigo-500" />,
      color: "bg-indigo-100"
    },
    {
      title: "Customize Bot Messages",
      description: "Personalize welcome and notification messages",
      icon: <Settings className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-100"
    },
    {
      title: "Invite Your First Members",
      description: "Share your community link and grow your audience",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-100"
    }
  ];

  return (
    <OnboardingLayout
      currentStep="complete"
      title="You're All Set! 🎉"
      description="Your Telegram community is ready to accept paid memberships"
      icon={<CheckCircle className="w-6 h-6 text-green-500" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          
          <motion.h2 
            className="text-xl font-semibold text-center text-green-800 mb-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Success! Your Community is Ready!
          </motion.h2>
          
          <motion.p 
            className="text-center text-green-700 mb-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your Telegram community has been successfully connected to Membify.
          </motion.p>
          
          <motion.div 
            className="space-y-3 mb-6"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                  ✓
                </div>
                <p className="text-green-700">
                  Community connection verified
                </p>
              </li>
              
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                  ✓
                </div>
                <p className="text-green-700">
                  Bot permissions configured
                </p>
              </li>
              
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                  ✓
                </div>
                <p className="text-green-700">
                  Ready to create subscription plans
                </p>
              </li>
            </ul>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Gauge className="mr-2 h-5 w-5 text-indigo-600" />
            Here are your next steps:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextSteps.map((step, index) => (
              <Card key={index} className="p-4 border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                <div className={`${step.color} w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
                  {step.icon}
                </div>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col space-y-4"
        >
          <Button 
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-6 text-lg font-medium shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
            onClick={handleCompleteOnboarding}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};

export default CompletionStep;
