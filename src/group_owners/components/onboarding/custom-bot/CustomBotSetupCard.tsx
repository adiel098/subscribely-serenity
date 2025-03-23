
import React, { useState } from "react";
import { ArrowLeft, Shield, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BotTokenInput } from "./BotTokenInput";
import BotCreationGuide from "./BotCreationGuide";

interface CustomBotSetupCardProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
  goToPreviousStep: () => void;
  onContinue: () => void;
  onVerifyConnection: () => void;
  isVerifying: boolean;
  verificationResults: any[] | null;
  verificationError: string | null;
}

export const CustomBotSetupCard: React.FC<CustomBotSetupCardProps> = ({
  customTokenInput,
  setCustomTokenInput,
  goToPreviousStep,
  onContinue,
  onVerifyConnection,
  isVerifying,
  verificationResults,
  verificationError
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
          />
          
          <BotCreationGuide />
          
          {verificationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}
          
          {verificationResults && verificationResults.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
              <h4 className="text-sm font-medium text-green-700 flex items-center gap-1.5 mb-2">
                <Shield className="h-4 w-4" /> Bot Verified Successfully
              </h4>
              <p className="text-sm text-green-600 mb-2">Your bot is connected to {verificationResults.length} groups/channels:</p>
              <ul className="space-y-1.5 mt-2">
                {verificationResults.map((chat, index) => (
                  <li key={index} className="text-sm flex items-center gap-1.5 text-gray-700">
                    <Link2 className="h-3.5 w-3.5 text-gray-500" />
                    {chat.title} <span className="text-xs text-gray-500">({chat.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {verificationResults && verificationResults.length === 0 && (
            <Alert className="mt-4 bg-amber-50 border-amber-100">
              <AlertTitle className="text-amber-800">No Groups Found</AlertTitle>
              <AlertDescription className="text-amber-700">
                Your bot token is valid, but the bot isn't added to any groups or channels yet. 
                Make sure to add your bot to your Telegram groups and grant it admin privileges.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPreviousStep}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Bot Selection
            </Button>
            
            <div className="space-x-3">
              <Button 
                variant="outline"
                onClick={onVerifyConnection}
                disabled={!customTokenInput || isVerifying}
                className="gap-1"
              >
                <Shield className="h-4 w-4" />
                {isVerifying ? "Verifying..." : "Verify Connection"}
              </Button>
              
              <Button 
                onClick={onContinue} 
                disabled={isVerifying}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
