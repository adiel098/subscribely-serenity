import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Star, Wallet, Bitcoin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TelegramPaymentOption } from "@/components/payments/TelegramPaymentOption";

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

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-8">
        <div className="container max-w-2xl mx-auto pt-8 px-4">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
            {community.description && (
              <p className="text-gray-600">{community.description}</p>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">Subscription Plans</h2>
            <div className="grid gap-4">
              {community.subscription_plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary shadow-lg bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${plan.price}</p>
                      <p className="text-sm text-gray-500">{plan.interval}</p>
                    </div>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <Star className="h-4 w-4 text-primary mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedPlan && (
            <div id="payment-methods" className="mt-12">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-center">Select Payment Method</h2>
                <p className="text-center text-gray-600">
                  Choose how you'd like to pay for the {selectedPlan.name} plan
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <TelegramPaymentOption
                    icon={CreditCard}
                    title="Credit Card"
                    isSelected={selectedPaymentMethod === 'stripe'}
                    onSelect={() => handlePaymentMethodSelect('stripe')}
                  />
                  <TelegramPaymentOption
                    icon={Wallet}
                    title="PayPal"
                    isSelected={selectedPaymentMethod === 'paypal'}
                    onSelect={() => handlePaymentMethodSelect('paypal')}
                  />
                  <TelegramPaymentOption
                    icon={Bitcoin}
                    title="Crypto"
                    isSelected={selectedPaymentMethod === 'crypto'}
                    onSelect={() => handlePaymentMethodSelect('crypto')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelegramMiniApp;
