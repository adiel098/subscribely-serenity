
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { CommunityHeader } from "@/features/telegram-mini-app/components/CommunityHeader";
import { SubscriptionPlans } from "@/features/telegram-mini-app/components/SubscriptionPlans";
import { PaymentMethods } from "@/features/telegram-mini-app/components/PaymentMethods";
import { LoadingScreen } from "@/features/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/features/telegram-mini-app/components/CommunityNotFound";
import { Plan, Community } from "@/features/telegram-mini-app/types";
import { useAuth } from "@/contexts/AuthContext";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const initData = searchParams.get("initData");
    const startParam = searchParams.get("start");

    const fetchCommunityData = async () => {
      try {
        console.log('Fetching community data with params:', { startParam, initData });
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          throw new Error('No active session');
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
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
        if (error.message === 'No active session') {
          navigate('/auth');
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load community data. Please try again."
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (startParam) {
      fetchCommunityData();
    } else {
      console.error("No start parameter provided");
      setLoading(false);
    }
  }, [searchParams, toast, navigate, user]);

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
