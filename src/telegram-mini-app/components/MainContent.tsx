import React, { useEffect } from "react";
import { CommunityHeader } from "./CommunityHeader";
import { ContentTabs } from "./tabs/ContentTabs";
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
  const activeSubscription = community && subscriptions?.find(sub => 
    isSubscriptionActive(sub) && sub.community_id === community.id
  );
  
  useEffect(() => {
    console.log("[MainContent] Component rendered with state:");
    console.log("[MainContent] Selected plan:", selectedPlan);
    console.log("[MainContent] Show payment methods:", showPaymentMethods);
    console.log("[MainContent] Show success:", showSuccess);
    console.log("[MainContent] Community:", community ? community.name : "No community selected");
    
    if (telegramUser) {
      console.log("[MainContent] Telegram user ID:", telegramUser.id);
      console.log("[MainContent] Telegram username:", telegramUser.username);
    }
  }, [telegramUser, selectedPlan, showPaymentMethods, showSuccess, community]);
  
  const handleRenew = (subscription) => {
    console.log("[MainContent] Processing renewal for subscription:", subscription);
    
    if (subscription && subscription.community) {
      if (subscription.community.id !== (community?.id || '')) {
        console.log("[MainContent] Switching community for renewal");
        handleSelectCommunity(subscription.community);
      }
      
      if (subscription.plan) {
        console.log("[MainContent] Setting plan for renewal:", subscription.plan);
        
        // Find the full plan data
        const fullPlan = community?.project_plans?.find(p => p.id === subscription.plan.id) || 
                        (subscription.community.project_plans?.find(p => p.id === subscription.plan.id));
        
        if (!fullPlan) {
          console.warn('⚠️ Could not find full plan data for subscription', subscription.id);
        }
        
        if (fullPlan) {
          handlePlanSelect(fullPlan);
        } else {
          handlePlanSelect(subscription.plan);
        }
      } else {
        console.error("[MainContent] Cannot renew: No plan found in subscription");
      }
      
      // Switch to subscribe tab and scroll to payment methods section
      handleTabChange("subscribe");
      
      // Wait for tab change and DOM update, then scroll to payment section
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-methods');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
    
    handleRenewSubscription(subscription);
  };
  
  return (
    <div className="telegram-mini-app-container mx-auto max-w-3xl">
      <div className="flex flex-col gap-4">
        {/* Only show the community header on the subscribe tab */}
        {community && activeTab === "subscribe" && <CommunityHeader community={community} />}
        
        <ContentTabs
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          communitySubscriptionPlans={community?.project_plans || []}
          selectedPlan={selectedPlan}
          onPlanSelect={handlePlanSelect}
          showPaymentMethods={showPaymentMethods}
          subscriptions={subscriptions || []}
          onRefreshSubscriptions={() => {}}
          onRenewSubscription={handleRenew}
          onSelectCommunity={handleSelectCommunity}
          telegramUserId={telegramUser?.id}
          community={community}
        />
        
        {community && showPaymentMethods && (
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
        )}
        
        <DebugWrapper
          telegramUser={telegramUser}
          community={community}
          activeSubscription={subscriptions?.[0]}
        />
      </div>
    </div>
  );
};
