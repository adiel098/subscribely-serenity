
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
import { EmailCollectionForm } from "@/telegram-mini-app/components/EmailCollectionForm";
import { TelegramMiniAppUser } from "@/telegram-mini-app/types/database.types";

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

interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
}

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initData = searchParams.get("initData");
    const startParam = searchParams.get("start");

    const fetchCommunityData = async () => {
      try {
        console.log('Fetching community data with params:', { startParam, initData });
        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: { 
            start: startParam,
            initData 
          }
        });

        console.log('Response from telegram-mini-app:', response);

        if (response.data?.community) {
          setCommunity(response.data.community);
          
          // Extract user data if available
          if (response.data.user) {
            const userData = response.data.user;
            setTelegramUser({
              id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              photo_url: userData.photo_url
            });
            
            // Check if user has email in the database
            if (userData.id) {
              checkUserEmail(userData.id);
            }
          }
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

    if (startParam) {
      fetchCommunityData();
    } else {
      console.error("No start parameter provided");
      setLoading(false);
    }
  }, [searchParams, toast]);

  const checkUserEmail = async (telegramId: string) => {
    try {
      const { data, error } = await supabase
        .from('telegram_mini_app_users')
        .select('email')
        .eq('telegram_id', telegramId)
        .single();
      
      if (error) throw error;
      
      // If user doesn't have an email, show the email collection form
      setShowEmailForm(!data.email);
      
      if (data.email) {
        setTelegramUser(prev => prev ? { ...prev, email: data.email } : null);
      }
    } catch (error) {
      console.error("Error checking user email:", error);
      // Default to showing the form if there's an error
      setShowEmailForm(true);
    }
  };

  const handleEmailFormComplete = () => {
    setShowEmailForm(false);
  };

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

  // Show email collection form if needed
  if (showEmailForm && telegramUser) {
    return <EmailCollectionForm telegramUserId={telegramUser.id} onComplete={handleEmailFormComplete} />;
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
