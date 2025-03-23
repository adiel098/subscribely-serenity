
import React from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Bot, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OfficialBotInstructions } from "./OfficialBotInstructions";

interface OfficialBotSetupCardProps {
  onComplete: () => void;
  goToPreviousStep: () => void;
}

export const OfficialBotSetupCard: React.FC<OfficialBotSetupCardProps> = ({
  onComplete,
  goToPreviousStep
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
        <div className="flex items-center mb-4 gap-2 text-blue-600">
          <Bot className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Membify Official Bot Setup</h3>
        </div>
        
        <div className="space-y-6">
          <p className="text-gray-600">
            Using the official Membify bot is the simplest way to manage your paid communities.
            Our bot is pre-configured and ready to use with your account.
          </p>
          
          <OfficialBotInstructions />
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-blue-700">
                <p className="font-medium">Why choose the official Membify bot?</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Fully managed and maintained by our team</li>
                  <li>Automatic updates and new features</li>
                  <li>Reliable performance and dedicated support</li>
                  <li>No technical setup required</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPreviousStep}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Bot Selection
            </Button>
            
            <Button 
              onClick={onComplete} 
              className="gap-1"
            >
              Continue to Connect Telegram <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
