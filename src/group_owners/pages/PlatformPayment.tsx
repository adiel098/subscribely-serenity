
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useActivePaymentMethods } from "../hooks/useActivePaymentMethods";
import { processPayment } from "../services/platformPaymentProcessor";
import { PlatformPaymentMethodsGrid } from "../components/platform-payment/PlatformPaymentMethodsGrid";
import { OrderSummaryCard } from "../components/platform-payment/OrderSummaryCard";
import { NoPlanSelectedAlert } from "../components/platform-payment/NoPlanSelectedAlert";

interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

export default function PlatformPayment() {
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: activePlatformPaymentMethods, isLoading } = useActivePaymentMethods();
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

  if (!selectedPlan) {
    return <NoPlanSelectedAlert />;
  }

  return (
    <div className="container max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Select Payment Method</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose how you'd like to pay for your "{selectedPlan.name}" subscription
        </p>
      </div>

      <OrderSummaryCard 
        planName={selectedPlan.name}
        planInterval={selectedPlan.interval}
        planPrice={selectedPlan.price}
      />

      <h2 className="text-xl font-semibold mb-4">Available Payment Methods</h2>
      
      <PlatformPaymentMethodsGrid
        paymentMethods={activePlatformPaymentMethods}
        isLoading={isLoading}
        selectedPlan={selectedPlan}
        isProcessing={isProcessing}
        onSelectPaymentMethod={handlePaymentProcess}
      />

      <div className="mt-6 text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/platform-plans')}
        >
          Back to Plans
        </Button>
      </div>
    </div>
  );
}
