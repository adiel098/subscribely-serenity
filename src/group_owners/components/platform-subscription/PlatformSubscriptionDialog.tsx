
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { useActivePaymentMethods } from "@/group_owners/hooks/useActivePaymentMethods";
import { processPayment } from "@/group_owners/services/platformPaymentService";
import { useToast } from "@/components/ui/use-toast";
import { PlatformPlansGrid } from "./PlatformPlansGrid";
import { PlatformPlanPaymentSection } from "./PlatformPlanPaymentSection";
import { SubscriptionSuccessScreen } from "./SubscriptionSuccessScreen";
import { PlatformPlan } from "./PlatformPlanCard";

interface PlatformSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlatformSubscriptionDialog = ({ open, onOpenChange }: PlatformSubscriptionDialogProps) => {
  const { plans, isLoading: plansLoading } = usePlatformPlans();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useActivePaymentMethods();
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = (plan: PlatformPlan) => {
    setSelectedPlan(plan);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentProcess = async () => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "No payment method selected",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await processPayment(selectedPlan, selectedPaymentMethod);

      setIsProcessing(false);
      setIsSuccess(true);

      toast({
        title: "Subscription Activated",
        description: `Your ${selectedPlan.name} subscription has been activated successfully!`,
      });
      
      // Close dialog after 2 seconds of showing success
      setTimeout(() => {
        handleReset();
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedPlan(null);
    setSelectedPaymentMethod(null);
    setIsSuccess(false);
  };

  const formatInterval = (interval: string) => {
    switch (interval) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      case 'lifetime': return 'one-time payment';
      default: return interval;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) handleReset();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Platform Subscription Plans</DialogTitle>
        </DialogHeader>
        
        {isSuccess ? (
          <SubscriptionSuccessScreen />
        ) : (
          <>
            <PlatformPlansGrid
              plans={plans}
              isLoading={plansLoading}
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
              formatInterval={formatInterval}
            />

            {selectedPlan && (
              <PlatformPlanPaymentSection
                selectedPlan={selectedPlan}
                paymentMethods={paymentMethods}
                paymentMethodsLoading={paymentMethodsLoading}
                onPaymentProcess={handlePaymentProcess}
                isProcessing={isProcessing}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
