
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  community_id: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
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
    // Parse parameters from URL
    const initData = searchParams.get("initData");
    const startParam = searchParams.get("start");
    
    console.log("TelegramMiniApp initialized with:", { 
      initData, 
      startParam,
      telegramWebApp: Boolean(window.Telegram?.WebApp)
    });

    // If Telegram WebApp is available, expand it for better user experience
    if (window.Telegram?.WebApp) {
      if (window.Telegram.WebApp.expand && !window.Telegram.WebApp.isExpanded) {
        window.Telegram.WebApp.expand();
      }
      if (window.Telegram.WebApp.ready) {
        window.Telegram.WebApp.ready();
      }
    }

    const fetchCommunityData = async () => {
      try {
        console.log('Fetching community data with params:', { startParam, initData });
        if (!startParam) {
          console.error("No community ID provided");
          setLoading(false);
          return;
        }

        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: { 
            start: startParam,
            initData 
          }
        });

        console.log('Response from telegram-mini-app:', response);

        if (response.data?.community) {
          setCommunity(response.data.community);
          console.log('Community data loaded successfully:', response.data.community);
          
          // Log the invite link for debugging
          if (response.data.community.telegram_invite_link) {
            console.log('Invite link from database:', response.data.community.telegram_invite_link);
          } else {
            console.warn('No invite link found in community data');
          }
        } else {
          console.error("No community found in response");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load community data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    // Always attempt to fetch community data, even without initData
    fetchCommunityData();
  }, [searchParams, toast]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
    toast({
      title: "Payment Successful! ",
      description: "You can now access the community.",
      duration: 5000,
    });
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
  };

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
              communityInviteLink={community.telegram_invite_link}
              showSuccess={showSuccess}
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
