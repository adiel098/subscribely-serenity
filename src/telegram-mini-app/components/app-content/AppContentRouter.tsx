
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
  
  // No community found
  if (!community) {
    return <ErrorDisplay message="Community not found" />;
  }
  
  // No user found
  if (!telegramUser) {
    return <ErrorDisplay message="Could not retrieve user data" />;
  }
  
  return (
    <MainContent
      community={community}
      telegramUser={telegramUser}
      selectedPlan={selectedPlan}
      showPaymentMethods={showPaymentMethods}
      showSuccess={showSuccess}
      subscriptions={subscriptions}
      activeTab={activeTab}
      handleTabChange={handleTabChange}
      handlePlanSelect={handlePlanSelect}
      handleCompletePurchase={handleCompletePurchase}
      handleRenewSubscription={handleRenewSubscription}
      handleSelectCommunity={handleSelectCommunity}
      subscriptionsLoading={subscriptionsLoading}
    />
  );
};
