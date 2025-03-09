
import React from "react";
import { CommunityHeader } from "./CommunityHeader";
import { ContentTabs } from "./tabs/ContentTabs";
import { PaymentSection } from "./payment/PaymentSection";
import { UserProfileCard } from "./user-profile/UserProfileCard";
import { DebugInfo } from "./debug/DebugInfo";
import { isDevelopment } from "../utils/telegramUtils";

export interface DebugInfoProps {
  telegramUser: any;
  community: any;
  activeSubscription?: any;
}

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(null);
  
  // Enhanced logging for debugging
  React.useEffect(() => {
    console.log("[MainContent] Component rendered with state:");
    console.log("[MainContent] Selected payment method:", selectedPaymentMethod);
    console.log("[MainContent] Selected plan:", selectedPlan);
    console.log("[MainContent] Show payment methods:", showPaymentMethods);
    console.log("[MainContent] Show success:", showSuccess);
    
    if (telegramUser) {
      console.log("[MainContent] Telegram user ID:", telegramUser.id);
      console.log("[MainContent] Telegram username:", telegramUser.username);
    }
  }, [telegramUser, selectedPaymentMethod, selectedPlan, showPaymentMethods, showSuccess]);

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    console.log(`[MainContent] Setting payment method to: ${method}`);
    setSelectedPaymentMethod(method);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex flex-col gap-6">
        <UserProfileCard 
          name={telegramUser.first_name ? 
            `${telegramUser.first_name} ${telegramUser.last_name || ''}` : 
            'Telegram User'
          }
          username={telegramUser.username}
          photoUrl={telegramUser.photo_url}
          email={telegramUser.email}
        />
        
        <CommunityHeader community={community} />
        
        <ContentTabs
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          communitySubscriptionPlans={community.subscription_plans}
          selectedPlan={selectedPlan}
          onPlanSelect={handlePlanSelect}
          showPaymentMethods={showPaymentMethods}
          subscriptions={subscriptions}
          onRefreshSubscriptions={() => {}}
          onRenewSubscription={handleRenewSubscription}
          onSelectCommunity={handleSelectCommunity}
          telegramUserId={telegramUser.id}
        />
        
        {(showPaymentMethods || showSuccess) && selectedPlan && (
          <PaymentSection
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onCompletePurchase={handleCompletePurchase}
            communityInviteLink={community.telegram_invite_link}
            showSuccess={showSuccess}
            telegramUserId={telegramUser.id}
            telegramUsername={telegramUser.username}
          />
        )}
        
        {isDevelopment() && (
          <DebugInfo 
            telegramUser={telegramUser}
            community={community}
            activeSubscription={subscriptions?.[0]}
          />
        )}
      </div>
    </div>
  );
};
