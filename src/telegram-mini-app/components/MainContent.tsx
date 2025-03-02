
import React from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { ContentLayout } from "@/telegram-mini-app/components/layout/ContentLayout";
import { MainContentSection } from "@/telegram-mini-app/components/layout/MainContentSection";
import { ErrorState } from "@/telegram-mini-app/components/error/ErrorState";
import { useMainContent } from "@/telegram-mini-app/hooks/useMainContent";

interface MainContentProps {
  community: Community;
  telegramUser: TelegramUser | null;
}

export const MainContent: React.FC<MainContentProps> = ({ community, telegramUser }) => {
  console.log("🔍 MainContent rendering with:", {
    community: community?.name,
    telegramUser: telegramUser?.username,
    telegramUserId: telegramUser?.id,
    plans: community?.subscription_plans?.length || 0,
    plansData: community?.subscription_plans || []
  });

  // Error handling for missing data
  if (!community) {
    return <ErrorState message="Community data is missing" />;
  }

  if (!telegramUser) {
    return <ErrorState message="Telegram user data is missing" />;
  }

  // Make sure subscription_plans always exists and is an array
  if (!community.subscription_plans || !Array.isArray(community.subscription_plans)) {
    console.warn("⚠️ subscription_plans is missing or not an array, initializing to empty array");
    community.subscription_plans = [];
  }

  // Ensure we have data before rendering
  if (!community || !community.subscription_plans) {
    console.error("❌ Missing community or subscription plans data");
    return <ErrorState message="Missing community or subscription plan data" />;
  }

  const {
    selectedPlan,
    selectedPaymentMethod,
    showSuccess,
    activeTab,
    subscriptions,
    refreshSubscriptions,
    handlePaymentMethodSelect,
    handleCompletePurchase,
    handlePlanSelect,
    handleTabChange,
    handleRenewSubscription,
    handleSelectCommunity
  } = useMainContent(community.id, telegramUser);

  return (
    <ContentLayout>
      <MainContentSection
        community={community}
        telegramUser={telegramUser}
        selectedPlan={selectedPlan}
        selectedPaymentMethod={selectedPaymentMethod}
        showSuccess={showSuccess}
        activeTab={activeTab}
        subscriptions={subscriptions}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        onCompletePurchase={handleCompletePurchase}
        onPlanSelect={handlePlanSelect}
        onTabChange={handleTabChange}
        onRenewSubscription={handleRenewSubscription}
        onSelectCommunity={handleSelectCommunity}
        onRefreshSubscriptions={refreshSubscriptions}
      />
    </ContentLayout>
  );
};
