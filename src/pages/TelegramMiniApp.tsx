
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { CommunityHeader } from "@/components/telegram-mini-app/CommunityHeader";
import { SubscriptionPlans } from "@/components/telegram-mini-app/SubscriptionPlans";
import { PaymentMethods } from "@/components/telegram-mini-app/PaymentMethods";
import { LoadingScreen } from "@/components/telegram-mini-app/LoadingScreen";
import { CommunityNotFound } from "@/components/telegram-mini-app/CommunityNotFound";
import { SuccessScreen } from "@/components/telegram-mini-app/SuccessScreen";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  subscription_plans: Plan[];
}

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initData = searchParams.get("initData");
    const startParam = searchParams.get("start");

    const fetchCommunityData = async () => {
      try {
        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: { 
            start: startParam,
            initData 
          }
        });

        if (response.data?.community) {
          setCommunity(response.data.community);
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (startParam) {
      fetchCommunityData();
    }
  }, [searchParams]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
    toast({
      title: "Payment Successful! 🎉",
      description: "You can now access the community.",
      duration: 5000,
    });
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (showSuccess) {
    return <SuccessScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!community) {
    return <CommunityNotFound />;
  }

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-8 px-4 space-y-12">
          <CommunityHeader community={community} />

          <SubscriptionPlans
            plans={community.subscription_plans}
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
          />

          {selectedPlan && (
            <PaymentMethods
              selectedPlan={selectedPlan}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onCompletePurchase={handleCompletePurchase}
            />
          )}

          {!selectedPlan && (
            <div className="flex justify-center py-8 animate-bounce">
              <ChevronDown className="h-6 w-6 text-primary/50" />
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelegramMiniApp;
