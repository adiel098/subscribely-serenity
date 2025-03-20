
import React from "react";
import { MainContent } from "../MainContent";
import { ErrorDisplay } from "../ErrorDisplay";

export const AppContentRouter = ({
  isCheckingUserData,
  community,
  telegramUser,
  selectedPlan,
  showPaymentMethods,
  showSuccess,
  subscriptions,
  activeTab,
  handleTabChange,
  handlePlanSelect,
  handleCompletePurchase,
  handleRenewSubscription,
  handleSelectCommunity,
  subscriptionsLoading
}) => {
  // Don't render content while checking user data
  if (isCheckingUserData) {
    return null;
  }
  
  // No user found
  if (!telegramUser) {
    return <ErrorDisplay message="Could not retrieve user data" onRetry={() => {}} />;
  }
  
  // When no community is found, we'll default to discover tab
  // This is the key change that enables discovery mode without a community ID
  const effectiveTab = !community && activeTab === "subscribe" ? "discover" : activeTab;
  
  return (
    <div className={`telegram-mini-app-container ${!community ? "pt-2 bg-gradient-to-b from-indigo-50/50 to-white" : ""}`}>
      <MainContent
        community={community}
        telegramUser={telegramUser}
        selectedPlan={selectedPlan}
        showPaymentMethods={showPaymentMethods}
        showSuccess={showSuccess}
        subscriptions={subscriptions}
        activeTab={effectiveTab}
        handleTabChange={handleTabChange}
        handlePlanSelect={handlePlanSelect}
        handleCompletePurchase={handleCompletePurchase}
        handleRenewSubscription={handleRenewSubscription}
        handleSelectCommunity={handleSelectCommunity}
        subscriptionsLoading={subscriptionsLoading}
      />
    </div>
  );
};
