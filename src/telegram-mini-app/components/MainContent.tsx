
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { useUserSubscriptions } from "@/telegram-mini-app/hooks/useUserSubscriptions";
import { DebugInfo } from "@/telegram-mini-app/components/debug/DebugInfo";
import { triggerHapticFeedback } from "@/telegram-mini-app/components/email-collection/emailFormUtils";
import { ErrorDisplay } from "./main-content/ErrorDisplay";
import { MainHeader } from "./main-content/MainHeader";
import { MainTabs } from "./main-content/MainTabs";
import { PaymentSectionWrapper } from "./main-content/PaymentSection";
import { useBackButton } from "./main-content/useBackButton";

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
    return <ErrorDisplay message="Error: Community data is missing" />;
  }

  if (!telegramUser) {
    return <ErrorDisplay message="Error: Telegram user data is missing" />;
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
  }, [telegramUser]);

  const resetSelection = () => {
    setSelectedPlan(null);
    setShowSuccess(false);
  };

  // Handle back button
  useBackButton(selectedPlan, activeTab, resetSelection);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetSelection();
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
    }
  };

  const handleSelectCommunity = (selectedCommunity: any) => {
    // In a real app, this would navigate to the community's page
    if (window.Telegram?.WebApp) {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    } else {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    }
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-purple-50/30">
        <div className="container max-w-2xl mx-auto pt-4 px-4 space-y-6">
          {/* Debug information */}
          <DebugInfo 
            telegramUser={telegramUser} 
            community={community} 
            activeTab={activeTab} 
          />
          
          {/* Header with user profile and community info */}
          <MainHeader telegramUser={telegramUser} community={community} />
          
          {/* Content tabs */}
          <MainTabs 
            community={community}
            activeTab={activeTab}
            selectedPlan={selectedPlan}
            subscriptions={subscriptions}
            onTabChange={handleTabChange}
            onPlanSelect={setSelectedPlan}
            onRenewSubscription={handleRenewSubscription}
            onSelectCommunity={handleSelectCommunity}
            refreshSubscriptions={refreshSubscriptions}
          />
          
          {/* Payment section */}
          <PaymentSectionWrapper
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            showSuccess={showSuccess}
            communityInviteLink={community.telegram_invite_link}
            telegramUserId={telegramUser?.id}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onCompletePurchase={handleCompletePurchase}
          />
          
          <div className="pb-10"></div>
        </div>
      </div>
    </ScrollArea>
  );
};
