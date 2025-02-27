
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { TelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { TabsContent } from "@/components/ui/tabs";
import { useUserSubscriptions } from "@/telegram-mini-app/hooks/useUserSubscriptions";
import { UserInfoCard } from "@/telegram-mini-app/components/UserInfoCard";
import { TabNavigation } from "@/telegram-mini-app/components/TabNavigation";
import { SubscribeTabContent } from "@/telegram-mini-app/components/SubscribeTabContent";
import { SubscriptionsTabContent } from "@/telegram-mini-app/components/SubscriptionsTabContent";
import { DiscoverTabContent } from "@/telegram-mini-app/components/DiscoverTabContent";

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
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
    refreshSubscriptions();
    
    // If we're in Telegram, use haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
    
    // If we're in Telegram, use haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedPlan(null);
    setShowSuccess(false);
    
    // If we're in Telegram, use haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
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
    // For now, we'll just show a message
    if (window.Telegram?.WebApp) {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    } else {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    }
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-4 px-4 space-y-6">
          {/* User information card */}
          <UserInfoCard telegramUser={telegramUser} community={community} />

          <CommunityHeader community={community} />

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          
          {/* Tab Content */}
          <TabsContent value="subscribe" className="mt-0">
            <SubscribeTabContent 
              communityInviteLink={community.telegram_invite_link}
              plans={community.subscription_plans}
              selectedPlan={selectedPlan}
              onPlanSelect={handlePlanSelect}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              showSuccess={showSuccess}
              onCompletePurchase={handleCompletePurchase}
              telegramUserId={telegramUser?.id}
            />
          </TabsContent>
          
          <TabsContent value="mySubscriptions" className="mt-0">
            <SubscriptionsTabContent 
              subscriptions={subscriptions}
              onRefresh={refreshSubscriptions}
              onRenew={handleRenewSubscription}
            />
          </TabsContent>
          
          <TabsContent value="discover" className="mt-0">
            <DiscoverTabContent onSelectCommunity={handleSelectCommunity} />
          </TabsContent>
          
          <div className="pb-10"></div>
        </div>
      </div>
    </ScrollArea>
  );
};
