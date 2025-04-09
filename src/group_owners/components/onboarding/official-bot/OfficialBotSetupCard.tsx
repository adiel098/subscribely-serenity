
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bot, ArrowLeft, AlertCircle, Check, Loader2 } from "lucide-react";
import { TelegramChatsList } from "../custom-bot/TelegramChatsList";
import { BotTokenInput } from "../custom-bot/BotTokenInput";
import { TelegramChat } from "../custom-bot/TelegramChatItem";

interface OfficialBotSetupCardProps {
  onComplete: () => void;
  goToPreviousStep: () => void;
}

export const OfficialBotSetupCard: React.FC<OfficialBotSetupCardProps> = ({
  onComplete,
  goToPreviousStep
}) => {
  const [officialTokenInput, setOfficialTokenInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<TelegramChat[] | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const hasVerifiedChats = verificationResults && verificationResults.length > 0;
  
  const onVerifyConnection = async () => {
    if (!officialTokenInput) {
      setVerificationError("Please enter a valid bot token");
      return;
    }
    
    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      const response = await fetch("/api/validate-bot-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ botToken: officialTokenInput })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to validate bot token");
      }
      
      if (data.valid) {
        setVerificationResults(data.chatList || []);
      } else {
        setVerificationError(data.message || "Invalid bot token");
      }
    } catch (error) {
      console.error("Error validating bot token:", error);
      setVerificationError(error instanceof Error ? error.message : "Failed to validate bot");
    } finally {
      setIsVerifying(false);
    }
  };
  
  const onContinue = async () => {
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate saving
      onComplete();
    } catch (error) {
      console.error("Error saving bot token:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChatsRefresh = (newChats: TelegramChat[]) => {
    setVerificationResults(newChats);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
        <h3 className="text-xl font-semibold mb-6">Set Up Membify Official Bot</h3>
        
        <div className="space-y-6 mb-8">
          <BotTokenInput 
            customTokenInput={officialTokenInput} 
            setCustomTokenInput={setOfficialTokenInput}
          />
          
          <div className="space-y-3">
            <h4 className="font-medium">How to set up the Membify official bot:</h4>
            <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
              <li>Add the Membify official bot to your Telegram channels and groups</li>
              <li>Make the bot an administrator in each channel or group</li>
              <li>Enter the bot token above and click "Verify Connection"</li>
              <li>Confirm that your channels and groups appear in the list</li>
            </ol>
          </div>
        </div>
        
        {verificationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{verificationError}</AlertDescription>
          </Alert>
        )}
        
        {verificationResults && (
          <TelegramChatsList 
            chats={verificationResults} 
            botToken={officialTokenInput}
            onChatsRefresh={handleChatsRefresh}
            disabled={isSaving}
          />
        )}
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            className="flex items-center gap-1.5"
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onVerifyConnection}
              disabled={!officialTokenInput || isVerifying || isSaving}
              className="flex items-center gap-1.5"
            >
              <Bot className="h-4 w-4" />
              {isVerifying ? 'Verifying...' : 'Verify Connection'}
            </Button>
            
            <Button
              onClick={onContinue}
              disabled={!hasVerifiedChats || isSaving}
              className="flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Continue
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
