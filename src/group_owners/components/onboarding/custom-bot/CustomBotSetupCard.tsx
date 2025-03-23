
import React from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BotTokenInput } from "./BotTokenInput";
import BotCreationGuide from "./BotCreationGuide";

interface CustomBotSetupCardProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
  validateBotToken: () => void;
  isValidating: boolean;
  validationSuccess: boolean | null;
  goToPreviousStep: () => void;
}

export const CustomBotSetupCard: React.FC<CustomBotSetupCardProps> = ({
  customTokenInput,
  setCustomTokenInput,
  validateBotToken,
  isValidating,
  validationSuccess,
  goToPreviousStep
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Set Up Your Custom Bot</h3>
        
        <div className="space-y-6">
          <BotTokenInput
            customTokenInput={customTokenInput}
            setCustomTokenInput={setCustomTokenInput}
            validateBotToken={validateBotToken}
            isValidating={isValidating}
            validationSuccess={validationSuccess}
          />
          
          <BotCreationGuide />
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPreviousStep}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Bot Selection
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
