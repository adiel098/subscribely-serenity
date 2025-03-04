
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { useActivePaymentMethods } from "@/group_owners/hooks/useActivePaymentMethods";
import { processPayment } from "@/group_owners/services/platformPaymentService";
import { useToast } from "@/components/ui/use-toast";
import { PaymentMethodsGrid } from "../platform-payment/PaymentMethodsGrid";

interface PlatformSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlatformSubscriptionDialog = ({ open, onOpenChange }: PlatformSubscriptionDialogProps) => {
  const { plans, isLoading: plansLoading } = usePlatformPlans();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useActivePaymentMethods();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setSelectedPaymentMethod(null);
  };

  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
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
          <div className="py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-6 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900">Subscription Activated!</h3>
            <p className="text-gray-600 mt-2">Your platform subscription has been successfully activated.</p>
          </div>
        ) : (
          <>
            {plansLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  {plans.filter(plan => plan.is_active).map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer ${
                        selectedPlan?.id === plan.id 
                          ? 'border-indigo-400 shadow-md ring-2 ring-indigo-200'
                          : plan.name.toLowerCase().includes('pro') 
                            ? 'border-indigo-200 shadow-sm' 
                            : 'border-muted'
                      }`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <CardHeader>
                        {plan.name.toLowerCase().includes('pro') && (
                          <Badge className="self-start mb-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                            Most Popular
                          </Badge>
                        )}
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline mb-4">
                          <span className="text-2xl font-bold">${plan.price}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            /{formatInterval(plan.interval)}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {selectedPlan?.id === plan.id ? (
                          <Badge className="w-full py-2 justify-center bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                            Selected
                          </Badge>
                        ) : (
                          <Badge className="w-full py-2 justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">
                            Click to Select
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {selectedPlan && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="border border-indigo-100 rounded-lg p-6 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold mb-6">
                      Payment Method for {selectedPlan.name} Plan
                    </h2>
                    
                    <PaymentMethodsGrid
                      paymentMethods={paymentMethods}
                      isLoading={paymentMethodsLoading}
                      selectedPlanPrice={selectedPlan.price}
                      isProcessing={isProcessing}
                      onSelectPaymentMethod={handleSelectPaymentMethod}
                      selectedPaymentMethod={selectedPaymentMethod}
                    />
                    
                    {selectedPaymentMethod && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6"
                      >
                        <Button 
                          onClick={handlePaymentProcess}
                          disabled={isProcessing}
                          className="w-full py-6 text-lg font-semibold gap-2 shadow-md hover:shadow-lg"
                          size="lg"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              Pay ${selectedPlan.price} for {selectedPlan.name} Plan
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
