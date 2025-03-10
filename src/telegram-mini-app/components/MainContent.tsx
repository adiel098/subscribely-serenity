
import React, { useEffect } from "react";
import { CommunityHeader } from "./CommunityHeader";
import { ContentTabs } from "./tabs/ContentTabs";
import { UserProfile } from "./user-profile/UserProfile";
import { PaymentWrapper } from "./payment/PaymentWrapper";
import { DebugWrapper } from "./debug/DebugWrapper";
import { isSubscriptionActive } from "./subscriptions/utils";

export const MainContent = ({
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
  // Find an active subscription for this community
  const activeSubscription = subscriptions?.find(sub => 
    isSubscriptionActive(sub) && sub.community_id === community.id
  );
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("[MainContent] Component rendered with state:");
    console.log("[MainContent] Selected plan:", selectedPlan);
    console.log("[MainContent] Show payment methods:", showPaymentMethods);
    console.log("[MainContent] Show success:", showSuccess);
    
    if (telegramUser) {
      console.log("[MainContent] Telegram user ID:", telegramUser.id);
      console.log("[MainContent] Telegram username:", telegramUser.username);
    }
  }, [telegramUser, selectedPlan, showPaymentMethods, showSuccess]);
  
  // Handle renew subscription (enhanced)
  const handleRenew = (subscription) => {
    console.log("[MainContent] Processing renewal for subscription:", subscription);
    
    // Find the community associated with this subscription
    if (subscription && subscription.community) {
      // If this is for a different community than currently selected, switch to it
      if (subscription.community.id !== community.id) {
        console.log("[MainContent] Switching community for renewal");
        handleSelectCommunity(subscription.community);
      }
      
      // Find the plan in the subscription and set it as selected
      if (subscription.plan) {
        console.log("[MainContent] Setting plan for renewal:", subscription.plan);
        
        // Find the corresponding full plan object from the community's plans
        const fullPlan = community.subscription_plans?.find(p => p.id === subscription.plan.id) || 
                        (subscription.community.subscription_plans?.find(p => p.id === subscription.plan.id));
        
        if (fullPlan) {
          // Set the selected plan and show payment methods
          handlePlanSelect(fullPlan);
        } else {
          // If can't find exact plan, use the one from subscription which has less details
          handlePlanSelect(subscription.plan);
        }
      } else {
        console.error("[MainContent] Cannot renew: No plan found in subscription");
      }
      
      // Switch to subscribe tab
      handleTabChange("subscribe");
    }
    
    // Call the original handler for any additional processing
    handleRenewSubscription(subscription);
  };
  
  return (
    <div className="telegram-mini-app-container mx-auto py-4 max-w-3xl">
      <div className="flex flex-col gap-4">
        <UserProfile
          telegramUser={telegramUser}
          subscriptions={subscriptions}
          onRenew={handleRenew}
        />
        
        <CommunityHeader community={community} />
        
        <ContentTabs
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          communitySubscriptionPlans={community.subscription_plans || []}
          selectedPlan={selectedPlan}
          onPlanSelect={handlePlanSelect}
          showPaymentMethods={showPaymentMethods}
          subscriptions={subscriptions || []}
          onRefreshSubscriptions={() => {}}
          onRenewSubscription={handleRenew}
          onSelectCommunity={handleSelectCommunity}
          telegramUserId={telegramUser?.id}
        />
        
        <PaymentWrapper
          selectedPlan={selectedPlan}
          showPaymentMethods={showPaymentMethods}
          showSuccess={showSuccess}
          telegramUser={telegramUser}
          communityId={community.id}
          activeSubscription={activeSubscription}
          communityInviteLink={community.telegram_invite_link}
          onCompletePurchase={handleCompletePurchase}
        />
        
        <DebugWrapper
          telegramUser={telegramUser}
          community={community}
          activeSubscription={subscriptions?.[0]}
        />
      </div>
    </div>
  );
};
