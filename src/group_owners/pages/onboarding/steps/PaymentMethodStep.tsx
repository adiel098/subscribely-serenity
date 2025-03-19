
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight, Check, Loader2, ArrowLeft } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentMethodConfig } from "@/group_owners/components/payments/PaymentMethodConfig";
import { useToast } from "@/components/ui/use-toast";

interface PaymentMethodStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  hasPaymentMethod: boolean;
  saveCurrentStep: (step: string) => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({ 
  goToNextStep, 
  goToPreviousStep,
  hasPaymentMethod,
  saveCurrentStep
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMethodAdded, setIsMethodAdded] = useState(hasPaymentMethod);
  const { toast } = useToast();

  const handlePaymentMethodAdded = () => {
    setIsMethodAdded(true);
    toast({
      title: "Payment Method Added",
      description: "Your payment method has been saved successfully",
      variant: "default",
    });
  };

  const handleContinue = async () => {
    if (!isMethodAdded && !hasPaymentMethod) {
      toast({
        variant: "destructive",
        title: "No Payment Method",
        description: "Please add at least one payment method to continue"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      saveCurrentStep("connect-telegram"); // Use a valid OnboardingStep
      goToNextStep();
    } catch (error) {
      console.error("Error saving payment method step:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress"
      });
    } finally {
      setIsSubmitting(false);
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
      currentStep="connect-telegram" // Use a valid OnboardingStep
      title="Set Up Payment Methods"
      description="Add payment options for your subscribers"
      icon={<CreditCard size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <motion.div 
        className="space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p 
          className="text-gray-600"
          variants={item}
        >
          Add at least one payment method so your community members can subscribe to your content.
          You can add more payment methods later from your dashboard.
        </motion.p>
        
        {hasPaymentMethod || isMethodAdded ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md flex items-center gap-3"
          >
            <motion.div
              animate={{ 
                rotate: [0, 15, 0, -15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Check className="h-5 w-5 text-green-600" />
            </motion.div>
            <div>
              <h4 className="font-medium">Payment Method Added!</h4>
              <p className="text-sm text-green-700">You can add more payment methods from your dashboard later.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Tabs defaultValue="stripe" onValueChange={setSelectedProvider}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
              </motion.div>
              
              <TabsContent value="stripe">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodConfig
                    provider="stripe"
                    onSuccess={handlePaymentMethodAdded}
                    imageSrc="/images/stripe-logo.png"
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="paypal">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodConfig
                    provider="paypal"
                    onSuccess={handlePaymentMethodAdded}
                    imageSrc="/images/paypal-logo.png"
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="crypto">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodConfig
                    provider="crypto"
                    onSuccess={handlePaymentMethodAdded}
                    imageSrc="/images/crypto-logo.png"
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
        
        <div className="pt-4 flex justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
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
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Button 
              onClick={handleContinue}
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Final Step
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
