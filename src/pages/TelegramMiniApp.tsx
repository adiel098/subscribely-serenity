import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Star, 
  Wallet, 
  Bitcoin, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  Crown,
  Gift,
  Heart
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TelegramPaymentOption } from "@/components/payments/TelegramPaymentOption";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="animate-pulse text-center space-y-4">
          <Sparkles className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-primary/70 animate-pulse">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="text-center space-y-4 p-6 glass-card rounded-xl">
          <Star className="h-16 w-16 text-yellow-400 mx-auto animate-pulse" />
          <p className="text-gray-600 text-lg">Community not found</p>
        </div>
      </div>
    );
  }

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-8 px-4 space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto">
                {community.description}
              </p>
            )}
          </div>

          {/* Plans Section */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="px-4 py-1.5">
                <Sparkles className="h-4 w-4 mr-2" />
                Premium Features
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-600">Select the perfect plan for you</p>
            </div>

            <div className="grid gap-6">
              {community.subscription_plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover-scale ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary shadow-xl bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:shadow-lg'
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Badge variant="outline" className="mb-2">
                        {plan.interval}
                      </Badge>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                        ${plan.price}
                      </p>
                      <p className="text-sm text-gray-500">{plan.interval}</p>
                    </div>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li 
                          key={index} 
                          className="flex items-center text-gray-700 animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Section */}
          {selectedPlan && (
            <div 
              id="payment-methods" 
              className="space-y-8 animate-fade-in"
            >
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="px-4 py-1.5">
                  <Gift className="h-4 w-4 mr-2" />
                  Final Step
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900">Choose Payment Method</h2>
                <p className="text-gray-600">
                  Select your preferred way to pay for the {selectedPlan.name} plan
                </p>
              </div>

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

              {selectedPaymentMethod && (
                <div className="flex justify-center animate-fade-in">
                  <Button size="lg" className="px-8 py-6 text-lg font-semibold gap-2">
                    <Heart className="h-5 w-5" />
                    Complete Purchase
                  </Button>
                </div>
              )}
            </div>
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
