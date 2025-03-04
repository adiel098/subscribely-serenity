
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { processPayment } from "../services/platformPaymentService";

interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

export const usePaymentProcess = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the selected plan from localStorage
    const planData = localStorage.getItem('selectedPlatformPlan');
    if (planData) {
      try {
        setSelectedPlan(JSON.parse(planData));
      } catch (e) {
        console.error('Error parsing plan data:', e);
      }
    }
  }, []);

  const handlePaymentProcess = async (paymentMethod: string) => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please go back and select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await processPayment(selectedPlan, paymentMethod);
      
      // Clear the selected plan from localStorage
      localStorage.removeItem('selectedPlatformPlan');

      toast({
        title: "Subscription Activated",
        description: `Your ${selectedPlan.name} subscription has been activated successfully!`,
      });

      // Redirect back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedPlan,
    isProcessing,
    handlePaymentProcess
  };
};
