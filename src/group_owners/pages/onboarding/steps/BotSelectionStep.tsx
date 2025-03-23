
import React, { useState } from "react";
import { Bot, Check, ArrowRight, Shield, Star, Sparkles } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { motion } from "framer-motion";

const BotSelectionStep = ({ 
  onComplete, 
  activeStep, 
  goToNextStep
}: { 
  onComplete: () => void, 
  activeStep: boolean,
  goToNextStep: () => void
}) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<"official" | "custom" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveBotSelection = async () => {
    if (!selected || !user?.id) {
      toast.error("Please select a bot type first");
      return;
    }

    setIsLoading(true);
    try {
      // First, create a community if needed (this would be handled in the next step)
      // For now, just save the user's bot preference to the profile
      
      // Set the custom bot preference in the global settings for this user
      await supabase.rpc('set_bot_preference', { 
        use_custom: selected === "custom"
      });
      
      toast.success(`${selected === "official" ? "Official" : "Custom"} bot selected successfully`);
      
      // Move to the next step
      goToNextStep();
    } catch (error) {
      console.error("Error saving bot selection:", error);
      toast.error("Failed to save your bot selection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep="bot-selection"
      title="Choose Your Bot"
      description="Select which Telegram bot you want to use for your communities"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={false}
    >
      <div className="grid gap-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Official Bot Card */}
          <motion.div
            whileHover={{ y: -5 }}
            animate={{ scale: selected === "official" ? 1.03 : 1 }}
          >
            <Card 
              className={`h-full cursor-pointer border-2 transition-all ${
                selected === "official" 
                  ? "border-primary bg-primary/5 shadow-lg" 
                  : "border-gray-200 hover:border-primary/30"
              }`}
              onClick={() => setSelected("official")}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  {selected === "official" && (
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">Membify Official Bot</CardTitle>
                <CardDescription>
                  Use Membify's official bot with your communities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Fully managed by Membify - zero setup</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Works for multiple groups without additional configuration</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Automatic updates and maintenance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Recommended for most users</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="bg-blue-50 w-full p-3 rounded-md text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p>Shared bot used by multiple Membify communities</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Custom Bot Card */}
          <motion.div
            whileHover={{ y: -5 }}
            animate={{ scale: selected === "custom" ? 1.03 : 1 }}
          >
            <Card 
              className={`h-full cursor-pointer border-2 transition-all ${
                selected === "custom" 
                  ? "border-primary bg-primary/5 shadow-lg" 
                  : "border-gray-200 hover:border-primary/30"
              }`}
              onClick={() => setSelected("custom")}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  {selected === "custom" && (
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">Your Custom Bot</CardTitle>
                <CardDescription>
                  Use your own Telegram bot with your communities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Full brand customization and personalization</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Your own bot username and avatar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Private message handling</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">Ideal for businesses with custom branding needs</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="bg-purple-50 w-full p-3 rounded-md text-sm text-purple-700">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>Requires creating your own bot with @BotFather</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div className="flex justify-center mt-8">
          <Button 
            onClick={saveBotSelection} 
            size="lg" 
            disabled={!selected || isLoading}
            className="min-w-[200px] gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-2">
          <p>This selection is permanent and cannot be changed later</p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default BotSelectionStep;
