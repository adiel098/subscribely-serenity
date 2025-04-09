
import React, { useState } from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Code, Shield, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { getTempOnboardingData, setTempProjectData } from "@/group_owners/hooks/useCreateCommunityGroup";
import { toast } from "sonner";

const botSetupSchema = z.object({
  bot_token: z.string().min(40, "Bot token must be valid").max(100, "Bot token is too long")
});

type BotSetupFormData = z.infer<typeof botSetupSchema>;

interface BotSetupStepProps {
  onComplete: () => void;
  goToPreviousStep: () => void;
  activeStep: boolean;
}

const BotSetupStep: React.FC<BotSetupStepProps> = ({ 
  onComplete, 
  goToPreviousStep,
  activeStep 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const tempData = getTempOnboardingData();
  
  const form = useForm<BotSetupFormData>({
    resolver: zodResolver(botSetupSchema),
    defaultValues: {
      bot_token: tempData.project?.bot_token || ""
    }
  });

  const onSubmit = async (data: BotSetupFormData) => {
    setIsSubmitting(true);
    try {
      // Verify token format (this is just a basic check)
      if (!data.bot_token.includes(":")) {
        toast.error("Invalid bot token format. Please check and try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Update temp data with bot token
      if (tempData.project) {
        const success = setTempProjectData({
          ...tempData.project,
          bot_token: data.bot_token
        });
        
        if (success) {
          console.log("Bot token stored temporarily:", data.bot_token);
          setTokenVerified(true);
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else {
          toast.error("Failed to store bot token");
        }
      } else {
        toast.error("Project data not found. Please go back to the project creation step.");
      }
    } catch (error) {
      console.error("Error in bot setup step:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Set Up Your Telegram Bot"
      description="Connect your bot to enable payment processing and member management"
      icon={<Bot className="w-6 h-6 text-indigo-500" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="space-y-6">
        <Card className="p-5 border border-blue-100 bg-blue-50">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Create a Telegram Bot First</h3>
              <p className="text-sm text-blue-700 mb-2">Before proceeding, you need to create a Telegram bot using BotFather.</p>
              <a 
                href="https://t.me/botfather" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full inline-flex items-center hover:bg-blue-700 transition-colors"
              >
                Open BotFather
              </a>
            </div>
          </div>
        </Card>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bot_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Token</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input 
                        placeholder="12345678:ABCdefGHIjklMNOpqrsTUVwxyz" 
                        {...field} 
                        className="py-6 font-mono"
                        type="password"
                      />
                      {tokenVerified && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Continue"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  );
};

export default BotSetupStep;
