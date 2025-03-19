
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight, Check, Loader2 } from "lucide-react";
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
      saveCurrentStep('payment-method');
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

  return (
    <OnboardingLayout 
      currentStep="payment-method"
      title="Set Up Payment Methods"
      description="Add payment options for your subscribers"
      icon={<CreditCard size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <div className="space-y-6">
        <p className="text-gray-600">
          Add at least one payment method so your community members can subscribe to your content.
          You can add more payment methods later from your dashboard.
        </p>
        
        {hasPaymentMethod || isMethodAdded ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium">Payment Method Added!</h4>
              <p className="text-sm text-green-700">You can add more payment methods from your dashboard later.</p>
            </div>
          </motion.div>
        ) : (
          <Tabs defaultValue="stripe" onValueChange={setSelectedProvider}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stripe">
              <PaymentMethodConfig
                provider="stripe"
                onSuccess={handlePaymentMethodAdded}
                imageSrc="/images/stripe-logo.png"
              />
            </TabsContent>
            
            <TabsContent value="paypal">
              <PaymentMethodConfig
                provider="paypal"
                onSuccess={handlePaymentMethodAdded}
                imageSrc="/images/paypal-logo.png"
              />
            </TabsContent>
            
            <TabsContent value="crypto">
              <PaymentMethodConfig
                provider="crypto"
                onSuccess={handlePaymentMethodAdded}
                imageSrc="/images/crypto-logo.png"
              />
            </TabsContent>
          </Tabs>
        )}
        
        <div className="pt-4 flex justify-end">
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
        </div>
      </div>
    </OnboardingLayout>
  );
};
