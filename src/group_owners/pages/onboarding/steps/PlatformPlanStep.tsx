
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Check, Loader2, ArrowLeft } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { processPayment } from "@/group_owners/services/platformPaymentService";
import { useToast } from "@/components/ui/use-toast";

interface PlatformPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  is_active: boolean;
}

interface PlatformPlanStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  hasPlatformPlan: boolean;
  saveCurrentStep: (step: string) => void;
}

export const PlatformPlanStep: React.FC<PlatformPlanStepProps> = ({ 
  goToNextStep, 
  goToPreviousStep,
  hasPlatformPlan,
  saveCurrentStep
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatformPlans();
  }, []);

  const fetchPlatformPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      setPlans(data || []);
      
      // If user already has a plan, we can proceed to the next step
      if (hasPlatformPlan) {
        // Just select the first plan for display purposes
        if (data && data.length > 0) {
          setSelectedPlan(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching platform plans:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load platform plans"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: PlatformPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = async () => {
    if (!selectedPlan && !hasPlatformPlan) {
      toast({
        variant: "destructive",
        title: "No Plan Selected",
        description: "Please select a plan to continue"
      });
      return;
    }

    if (hasPlatformPlan) {
      // If user already has a plan, just go to the next step
      goToNextStep();
      return;
    }

    setIsProcessing(true);
    try {
      // We'll use a simplified payment process for the onboarding
      // The actual payment will be handled in the PaymentMethodStep
      await processPayment(selectedPlan!, 'card');
      saveCurrentStep('platform-plan');
      goToNextStep();
    } catch (error) {
      console.error("Error processing plan selection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process plan selection"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getIntervalText = (interval: string) => {
    switch (interval) {
      case 'monthly': return '/month';
      case 'quarterly': return '/quarter';
      case 'yearly': return '/year';
      case 'lifetime': return ' one-time';
      default: return `/${interval}`;
    }
  };

  return (
    <OnboardingLayout 
      currentStep="platform-plan"
      title="Choose Your Platform Plan"
      description="Select a subscription plan that fits your community needs"
      icon={<Zap size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-28 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`border ${
                    selectedPlan?.id === plan.id || (hasPlatformPlan && plans[0]?.id === plan.id) 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                      : 'border-gray-200 hover:border-indigo-300'
                  } transition-all cursor-pointer h-full flex flex-col`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-end gap-1 mb-4">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 mb-1">{getIntervalText(plan.interval)}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={selectedPlan?.id === plan.id || (hasPlatformPlan && plans[0]?.id === plan.id) ? "default" : "outline"} 
                      className={`w-full ${
                        selectedPlan?.id === plan.id || (hasPlatformPlan && plans[0]?.id === plan.id)
                          ? "bg-indigo-600 hover:bg-indigo-700" 
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan);
                      }}
                    >
                      {selectedPlan?.id === plan.id || (hasPlatformPlan && plans[0]?.id === plan.id) ? (
                        <span className="flex items-center gap-2">
                          <Check size={16} />
                          Selected
                        </span>
                      ) : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="pt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            size="lg" 
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={(!selectedPlan && !hasPlatformPlan) || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {hasPlatformPlan ? 'Continue' : 'Select Plan & Continue'}
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
