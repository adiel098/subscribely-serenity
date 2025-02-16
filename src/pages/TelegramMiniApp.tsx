import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkle, CreditCard, Check, Star } from "lucide-react";

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

  useEffect(() => {
    const initData = searchParams.get("initData");
    const startParam = searchParams.get("start");

    const fetchCommunityData = async () => {
      try {
        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: { start: startParam, initData }
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
    // טיפול בתשלום יתווסף בשלב הבא
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* כותרת הקהילה */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-8 pb-6 px-4 text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkle className="h-6 w-6 text-primary" />
          {community?.name}
        </h1>
        {community?.description && (
          <p className="text-gray-600 max-w-lg mx-auto text-sm">
            {community.description}
          </p>
        )}
      </div>

      {/* רשימת התוכניות */}
      <div className="px-4 mt-6 space-y-4 max-w-md mx-auto">
        {community?.subscription_plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${plan.price}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {plan.interval}
                </div>
              </div>
            </div>

            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <Button
              className="w-full gap-2"
              onClick={() => handleSubscribe(plan)}
            >
              <CreditCard className="h-4 w-4" />
              Subscribe
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelegramMiniApp;
