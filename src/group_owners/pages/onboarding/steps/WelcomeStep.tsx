
import React from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Rocket, ChevronRight, Sparkles, Check, Bot, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeStepProps {
  onComplete: () => void;
  activeStep: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete, activeStep }) => {
  return (
    <OnboardingLayout
      currentStep="welcome"
      title="Welcome to Membify! 👋"
      description="Let's set up your paid Telegram communities in a few simple steps"
      icon={<Rocket className="w-6 h-6" />}
      showBackButton={false}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-300/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
          
          <h2 className="text-xl font-semibold text-indigo-900 mb-4">
            What You'll Need to Get Started
          </h2>
          
          <ul className="space-y-4">
            {[
              { 
                icon: <Bot className="h-5 w-5 text-indigo-600" />, 
                title: "Telegram Bot Token", 
                description: "Create a bot with @BotFather or use an existing one" 
              },
              { 
                icon: <MessageSquare className="h-5 w-5 text-purple-600" />, 
                title: "Telegram Group or Channel", 
                description: "Where your subscribers will join" 
              },
              { 
                icon: <Sparkles className="h-5 w-5 text-amber-600" />, 
                title: "Admin Privileges", 
                description: "Make sure your bot is an admin in your group/channel" 
              }
            ].map((item, index) => (
              <li key={index} className="flex gap-3 items-start">
                <div className="rounded-full bg-white p-2 shadow-sm border border-indigo-100 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
            <h3 className="flex items-center text-blue-800 font-medium gap-2">
              <Check className="h-5 w-5 text-blue-600" />
              Fast & Easy Setup
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              The entire process takes just a few minutes. We'll guide you through each step!
            </p>
          </div>
          
          <Button 
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Let's Get Started
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
