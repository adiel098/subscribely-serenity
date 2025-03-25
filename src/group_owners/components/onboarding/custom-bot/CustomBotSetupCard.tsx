
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bot, ArrowLeft, AlertCircle, Check, Loader2 } from "lucide-react";
import { TelegramChat } from "./TelegramChatItem";
import { TelegramChatsList } from "./TelegramChatsList";
import { BotTokenInput } from "./BotTokenInput";

interface CustomBotSetupCardProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
  goToPreviousStep: () => void;
  onContinue: () => void;
  onVerifyConnection: () => void;
  isVerifying: boolean;
  verificationResults: TelegramChat[] | null;
  verificationError: string | null;
  onChatsRefresh?: (newChats: TelegramChat[]) => void;
  isSaving?: boolean;
}

export const CustomBotSetupCard: React.FC<CustomBotSetupCardProps> = ({
  customTokenInput,
  setCustomTokenInput,
  goToPreviousStep,
  onContinue,
  onVerifyConnection,
  isVerifying,
  verificationResults,
  verificationError,
  onChatsRefresh,
  isSaving = false
}) => {
  const hasVerifiedChats = verificationResults && verificationResults.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
        <h3 className="text-xl font-semibold mb-6">Set Up Your Custom Bot</h3>
        
        <div className="space-y-6 mb-8">
          {/* Replace Label+Input with BotTokenInput component */}
          <BotTokenInput 
            customTokenInput={customTokenInput} 
            setCustomTokenInput={setCustomTokenInput}
          />
          
          <div className="space-y-3">
            <h4 className="font-medium">How to create a Telegram bot:</h4>
            <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
              <li>Open Telegram and search for @BotFather</li>
              <li>Send the /newbot command and follow the instructions</li>
              <li>BotFather will provide a token (keep it secure)</li>
              <li>Copy the API token provided and paste it above</li>
              <li>Make your bot an admin in your channels and groups</li>
            </ol>
          </div>
          
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://t.me/BotFather', '_blank')}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              disabled={isSaving}
            >
              Open @BotFather in Telegram
            </Button>
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
            botToken={customTokenInput}
            onChatsRefresh={onChatsRefresh}
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
              disabled={!customTokenInput || isVerifying || isSaving}
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
