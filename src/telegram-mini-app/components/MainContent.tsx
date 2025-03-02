
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { useUserSubscriptions } from "@/telegram-mini-app/hooks/useUserSubscriptions";
import { UserProfileCard } from "@/telegram-mini-app/components/user-profile/UserProfileCard";
import { DebugInfo } from "@/telegram-mini-app/components/debug/DebugInfo";
import { ContentTabs } from "@/telegram-mini-app/components/tabs/ContentTabs";
import { PaymentSection } from "@/telegram-mini-app/components/payment/PaymentSection";
import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { triggerHapticFeedback } from "@/telegram-mini-app/components/email-collection/emailFormUtils";

interface MainContentProps {
  community: Community;
  telegramUser: TelegramUser | null;
}

export const MainContent: React.FC<MainContentProps> = ({ community, telegramUser }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribe");
  const { subscriptions, isLoading: subscriptionsLoading, refetch: refreshSubscriptions } = 
    useUserSubscriptions(telegramUser?.id);

  console.log("🔍 MainContent rendering with:", {
    community: community?.name,
    telegramUser: telegramUser?.username,
    telegramUserId: telegramUser?.id,
    plans: community?.subscription_plans?.length || 0,
    plansData: community?.subscription_plans || []
  });

  // Error handling for missing data
  if (!community) {
    return (
      <motion.div 
        className="p-4 bg-red-50 text-red-700 rounded-md m-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Error: Community data is missing</span>
        </div>
      </motion.div>
    );
  }

  if (!telegramUser) {
    return (
      <motion.div 
        className="p-4 bg-red-50 text-red-700 rounded-md m-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Error: Telegram user data is missing</span>
        </div>
      </motion.div>
    );
  }

  // Make sure subscription_plans always exists and is an array
  if (!community.subscription_plans || !Array.isArray(community.subscription_plans)) {
    console.warn("⚠️ subscription_plans is missing or not an array, initializing to empty array");
    community.subscription_plans = [];
  }

  // Log user info for debugging
  useEffect(() => {
    if (telegramUser) {
      console.log("👤 Telegram User Info in MainContent:", telegramUser);
    } else {
      console.log("⚠️ No Telegram user data available in MainContent");
    }
    
    // If we're in Telegram, try to use BackButton
    if (window.Telegram?.WebApp?.BackButton) {
      if (selectedPlan && activeTab === "subscribe") {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          setSelectedPlan(null);
          setShowSuccess(false);
          window.Telegram.WebApp.BackButton.hide();
        });
      } else {
        window.Telegram.WebApp.BackButton.hide();
      }
    }
  }, [telegramUser, selectedPlan, activeTab]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
    triggerHapticFeedback('selection');
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
    refreshSubscriptions();
    triggerHapticFeedback('success');
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
    triggerHapticFeedback('selection');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedPlan(null);
    setShowSuccess(false);
    triggerHapticFeedback('selection');
  };

  const handleRenewSubscription = (subscription: any) => {
    // Find matching plan in current community
    const matchingPlan = community.subscription_plans.find(
      (plan) => plan.id === subscription.plan?.id
    );
    
    if (matchingPlan) {
      setSelectedPlan(matchingPlan);
      setActiveTab("subscribe");
      document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' });
      triggerHapticFeedback('selection');
    }
  };

  const handleSelectCommunity = (selectedCommunity: any) => {
    // In a real app, this would navigate to the community's page
    // For now, we'll just show a message
    if (window.Telegram?.WebApp) {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    } else {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    }
    triggerHapticFeedback('selection');
  };

  // Ensure we have data before rendering
  if (!community || !community.subscription_plans) {
    console.error("❌ Missing community or subscription plans data");
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-gray-700">Missing community or subscription plan data</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-background to-blue-50/30">
        <div className="w-full mx-auto px-4 space-y-6 pb-20">
          {/* Debug information */}
          <DebugInfo 
            telegramUser={telegramUser} 
            community={community} 
            activeTab={activeTab} 
          />
          
          {/* Telegram User Info - with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto"
          >
            <UserProfileCard telegramUser={telegramUser} community={community} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-md mx-auto"
          >
            <CommunityHeader community={community} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full"
          >
            <ContentTabs
              activeTab={activeTab}
              handleTabChange={handleTabChange}
              communitySubscriptionPlans={community.subscription_plans}
              selectedPlan={selectedPlan}
              onPlanSelect={handlePlanSelect}
              showPaymentMethods={!!selectedPlan}
              subscriptions={subscriptions}
              onRefreshSubscriptions={refreshSubscriptions}
              onRenewSubscription={handleRenewSubscription}
              onSelectCommunity={handleSelectCommunity}
            />
          </motion.div>
          
          <AnimatePresence>
            {selectedPlan && (
              <motion.div
                key="payment-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto"
              >
                <PaymentSection
                  selectedPlan={selectedPlan}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodSelect={handlePaymentMethodSelect}
                  onCompletePurchase={handleCompletePurchase}
                  communityInviteLink={community.telegram_invite_link}
                  showSuccess={showSuccess}
                  telegramUserId={telegramUser?.id}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pb-10"></div>
        </div>
      </div>
    </ScrollArea>
  );
};
