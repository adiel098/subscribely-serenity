import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkle, CreditCard, Check, Star, Wallet, Bitcoin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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

const PaymentMethodCard = ({ icon: Icon, title, description, onClick }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  onClick: () => void;
}) => (
  <Card 
    className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
    onClick={onClick}
  >
    <CardContent className="p-6 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

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

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    // Scroll to payment methods
    const paymentSection = document.getElementById('payment-methods');
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    // Here you would implement the actual payment processing
    console.log(`Selected payment method: ${method}`);
  };

  const getPlanGridCols = (plansCount: number) => {
    if (plansCount <= 3) return 'md:grid-cols-3';
    if (plansCount === 4) return 'md:grid-cols-2';
    return 'md:grid-cols-1';
  };

  const getSavingsPercent = (plan: Plan) => {
    if (plan.interval === 'yearly') return '20%';
    if (plan.interval === 'half-yearly') return '15%';
    if (plan.interval === 'quarterly') return '10%';
    return '0%';
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case 'half-yearly': return '6 months';
      case 'yearly': return 'year';
      default: return interval;
    }
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background pt-8 pb-12 px-4 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 animate-fade-in">
            <Sparkle className="h-8 w-8 text-primary" />
            {community.name}
          </h1>
          {community.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in delay-100">
              {community.description}
            </p>
          )}
          <div className="text-sm text-gray-500 flex items-center justify-center gap-2 animate-fade-in delay-200">
            <Check className="h-4 w-4 text-green-500" />
            Join our exclusive community today!
          </div>
        </div>

        {/* Plans Grid */}
        <div className={`px-4 mt-8 grid gap-6 max-w-7xl mx-auto ${getPlanGridCols(community.subscription_plans.length)}`}>
          {community.subscription_plans.map((plan, index) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${plan.price}</div>
                    <div className="text-sm text-gray-500">
                      per {getIntervalLabel(plan.interval)}
                    </div>
                    {getSavingsPercent(plan) !== '0%' && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Save {getSavingsPercent(plan)}
                      </div>
                    )}
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3 pt-4 border-t">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleSubscribe(plan)}
                >
                  <CreditCard className="h-4 w-4" />
                  Choose Plan
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods Section */}
        <div id="payment-methods" className="mt-12 px-4 max-w-2xl mx-auto">
          {selectedPlan && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold text-center">Payment Method</h2>
              <p className="text-gray-600 text-center mb-8">
                Choose how you'd like to pay for the {selectedPlan.name} plan
              </p>
              <div className="grid gap-4">
                <PaymentMethodCard
                  icon={CreditCard}
                  title="Credit Card"
                  description="Pay securely with your credit card via Stripe"
                  onClick={() => handlePaymentMethodSelect('stripe')}
                />
                <PaymentMethodCard
                  icon={Wallet}
                  title="PayPal"
                  description="Fast and secure payment with PayPal"
                  onClick={() => handlePaymentMethodSelect('paypal')}
                />
                <PaymentMethodCard
                  icon={Bitcoin}
                  title="Cryptocurrency"
                  description="Pay with Bitcoin or other cryptocurrencies"
                  onClick={() => handlePaymentMethodSelect('crypto')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelegramMiniApp;
