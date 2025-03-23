
import React, { useState } from "react";
import { Bot, ArrowLeft, ExternalLink, Check, AlertCircle } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomBotSetupStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const CustomBotSetupStep = ({
  onComplete,
  activeStep,
  goToPreviousStep
}: CustomBotSetupStepProps) => {
  const navigate = useNavigate();
  const [customTokenInput, setCustomTokenInput] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

  const validateBotToken = async () => {
    if (!customTokenInput) {
      toast.error("Please enter a valid bot token");
      return;
    }

    setIsValidating(true);
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken: customTokenInput,
          communityId: null // Will be associated with all communities
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        setValidationSuccess(true);
        
        // Save the token
        await supabase.rpc('set_bot_preference', { 
          use_custom: true,
          custom_token: customTokenInput
        });
        
        toast.success("Bot token validated and saved successfully!");
        
        // Small delay before continuing to next step
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setValidationSuccess(false);
        toast.error(`Invalid bot token: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error validating bot token:", error);
      setValidationSuccess(false);
      toast.error("Failed to validate bot token. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Custom Bot Setup"
      description="Configure your custom Telegram bot"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Set Up Your Custom Bot</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bot-token">Bot Token from @BotFather</Label>
                <div className="flex gap-2">
                  <Input
                    id="bot-token"
                    type="password"
                    value={customTokenInput}
                    onChange={(e) => setCustomTokenInput(e.target.value)}
                    placeholder="Enter your bot token"
                    className="flex-1"
                  />
                  <Button 
                    onClick={validateBotToken} 
                    disabled={isValidating || !customTokenInput}
                  >
                    {isValidating ? "Validating..." : "Validate & Save"}
                  </Button>
                </div>
                
                {validationSuccess === true && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                    <Check className="h-4 w-4" />
                    <span>Bot token validated successfully!</span>
                  </div>
                )}
                
                {validationSuccess === false && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Invalid bot token. Please check and try again.</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mt-6">
                <h4 className="font-medium">How to create a Telegram bot:</h4>
                <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
                  <li>Open Telegram and search for @BotFather</li>
                  <li>Send /newbot command and follow the instructions</li>
                  <li>Copy the API token provided and paste it above</li>
                </ol>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={() => window.open('https://t.me/BotFather', '_blank')}
                >
                  Open BotFather <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
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
      </div>
    </OnboardingLayout>
  );
};

export default CustomBotSetupStep;
