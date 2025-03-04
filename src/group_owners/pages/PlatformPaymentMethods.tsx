
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useActivePaymentMethods } from "../hooks/useActivePaymentMethods";
import { usePaymentProcess } from "../hooks/usePaymentProcess";
import { NoPlanSelectedAlert } from "../components/platform-payment/NoPlanSelectedAlert";
import { OrderSummaryCard } from "../components/platform-payment/OrderSummaryCard";
import { PaymentMethodsGrid } from "../components/platform-payment/PaymentMethodsGrid";

export default function PlatformPaymentMethods() {
  const { data: activePlatformPaymentMethods, isLoading } = useActivePaymentMethods();
  const { selectedPlan, isProcessing, handlePaymentProcess } = usePaymentProcess();
  const navigate = useNavigate();

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

      <OrderSummaryCard selectedPlan={selectedPlan} />

      <h2 className="text-xl font-semibold mb-4">Available Payment Methods</h2>
      
      <PaymentMethodsGrid
        paymentMethods={activePlatformPaymentMethods}
        isLoading={isLoading}
        selectedPlanPrice={selectedPlan.price}
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
