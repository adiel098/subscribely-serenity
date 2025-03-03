
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
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex flex-col gap-6">
        <CommunityHeader community={community} />
        
        <UserProfileCard 
          name={telegramUser.first_name ? 
            `${telegramUser.first_name} ${telegramUser.last_name || ''}` : 
            'Telegram User'
          }
          username={telegramUser.username}
          photoUrl={telegramUser.photo_url}
          email={telegramUser.email}
        />
        
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
        />
        
        {(showPaymentMethods || showSuccess) && selectedPlan && (
          <PaymentSection
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={setSelectedPaymentMethod}
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
