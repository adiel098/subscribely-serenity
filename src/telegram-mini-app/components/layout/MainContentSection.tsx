
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { UserProfileCard } from "@/telegram-mini-app/components/user-profile/UserProfileCard";
import { DebugInfo } from "@/telegram-mini-app/components/debug/DebugInfo";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { ContentTabs } from "@/telegram-mini-app/components/tabs/ContentTabs";
import { PaymentSection } from "@/telegram-mini-app/components/payment/PaymentSection";
import { Subscription } from "@/telegram-mini-app/services/memberService";

interface MainContentSectionProps {
  community: Community;
  telegramUser: TelegramUser;
  selectedPlan: Plan | null;
  selectedPaymentMethod: string | null;
  showSuccess: boolean;
  activeTab: string;
  subscriptions: Subscription[];
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  onPlanSelect: (plan: Plan) => void;
  onTabChange: (value: string) => void;
  onRenewSubscription: (subscription: Subscription) => void;
  onSelectCommunity: (community: any) => void;
  onRefreshSubscriptions: () => void;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
  community,
  telegramUser,
  selectedPlan,
  selectedPaymentMethod,
  showSuccess,
  activeTab,
  subscriptions,
  onPaymentMethodSelect,
  onCompletePurchase,
  onPlanSelect,
  onTabChange,
  onRenewSubscription,
  onSelectCommunity,
  onRefreshSubscriptions
}) => {
  return (
    <>
      {/* Debug information */}
      <DebugInfo 
        telegramUser={telegramUser} 
        community={community} 
        activeTab={activeTab} 
      />
      
      {/* Telegram User Info - with animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <UserProfileCard telegramUser={telegramUser} community={community} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full"
      >
        <CommunityHeader community={community} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full"
      >
        <ContentTabs
          activeTab={activeTab}
          handleTabChange={onTabChange}
          communitySubscriptionPlans={community.subscription_plans}
          selectedPlan={selectedPlan}
          onPlanSelect={onPlanSelect}
          showPaymentMethods={!!selectedPlan}
          subscriptions={subscriptions}
          onRefreshSubscriptions={onRefreshSubscriptions}
          onRenewSubscription={onRenewSubscription}
          onSelectCommunity={onSelectCommunity}
        />
      </motion.div>
      
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            key="payment-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <PaymentSection
              selectedPlan={selectedPlan}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelect={onPaymentMethodSelect}
              onCompletePurchase={onCompletePurchase}
              communityInviteLink={community.telegram_invite_link}
              showSuccess={showSuccess}
              telegramUserId={telegramUser?.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
