import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkle, CreditCard, Check, Star, Wallet, Bitcoin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentMethodCard } from "@/components/payments/PaymentMethodCard";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
}

interface Community {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 p-6">
          <Star className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">Community not found</p>
        </div>
      </div>
    );
  }

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-8">
        <div id="payment-methods" className="container max-w-2xl mx-auto pt-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">בחר אמצעי תשלום</h2>
            <div className="grid grid-cols-3 gap-4">
              <PaymentMethodCard
                icon={CreditCard}
                title="כרטיס אשראי"
                description=""
                isActive={selectedPaymentMethod === 'stripe'}
                onToggle={() => handlePaymentMethodSelect('stripe')}
                isConfigured={true}
                onConfigure={() => {}}
              />
              <PaymentMethodCard
                icon={Wallet}
                title="PayPal"
                description=""
                isActive={selectedPaymentMethod === 'paypal'}
                onToggle={() => handlePaymentMethodSelect('paypal')}
                isConfigured={true}
                onConfigure={() => {}}
              />
              <PaymentMethodCard
                icon={Bitcoin}
                title="קריפטו"
                description=""
                isActive={selectedPaymentMethod === 'crypto'}
                onToggle={() => handlePaymentMethodSelect('crypto')}
                isConfigured={true}
                onConfigure={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelegramMiniApp;
