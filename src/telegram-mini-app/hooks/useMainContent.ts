
import { useState, useEffect } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { useUserSubscriptions } from "@/telegram-mini-app/hooks/useUserSubscriptions";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { triggerHapticFeedback } from "@/telegram-mini-app/components/email-collection/emailFormUtils";

export const useMainContent = (communityId: string, telegramUser: TelegramUser | null) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribe");
  
  const { 
    subscriptions, 
    isLoading: subscriptionsLoading, 
    refetch: refreshSubscriptions 
  } = useUserSubscriptions(telegramUser?.id);

  // Set up Telegram back button handling
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
    if (!subscription.plan?.id) return;
    
    setSelectedPlan(subscription.plan);
    setActiveTab("subscribe");
    document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' });
    triggerHapticFeedback('selection');
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

  return {
    selectedPlan,
    selectedPaymentMethod,
    showSuccess,
    activeTab,
    subscriptions,
    subscriptionsLoading,
    refreshSubscriptions,
    handlePaymentMethodSelect,
    handleCompletePurchase,
    handlePlanSelect,
    handleTabChange,
    handleRenewSubscription,
    handleSelectCommunity
  };
};
