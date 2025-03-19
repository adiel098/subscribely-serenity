
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
      
      if (hasPlatformPlan) {
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
      goToNextStep();
      return;
    }

    setIsProcessing(true);
    try {
      await processPayment(selectedPlan!, 'card');
      saveCurrentStep('create-plans'); // Updated from 'platform-plan' to 'create-plans'
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <OnboardingLayout 
      currentStep="create-plans" // Updated from 'platform-plan' to 'create-plans'
      title="Choose Your Platform Plan"
      description="Select a subscription plan that fits your community needs"
      icon={<Zap size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <motion.div 
        className="space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Card className="border border-gray-200">
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
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -5, 
                  transition: { duration: 0.2 } 
                }}
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
                    <motion.h3 
                      className="text-lg font-semibold text-gray-900"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {plan.name}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {plan.description}
                    </motion.p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <motion.div 
                      className="flex items-end gap-1 mb-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: 0.5 + index * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 mb-1">{getIntervalText(plan.interval)}</span>
                    </motion.div>
                    <motion.ul 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {plan.features && Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-start gap-2 text-gray-700"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.05 + featureIndex * 0.05 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              delay: 0.7 + index * 0.05 + featureIndex * 0.05,
                              type: "spring",
                              stiffness: 300
                            }}
                          >
                            <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </CardContent>
                  <CardFooter>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full"
                    >
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
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 0.5 }}
                            >
                              <Check size={16} />
                            </motion.div>
                            Selected
                          </span>
                        ) : "Select Plan"}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="pt-4 flex justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
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
          </motion.div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};
