
import React from "react";
import { motion } from "framer-motion";
import { ContentTabs } from "@/telegram-mini-app/components/tabs/ContentTabs";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { triggerHapticFeedback } from "@/telegram-mini-app/components/email-collection/emailFormUtils";

interface MainTabsProps {
  community: Community;
  activeTab: string;
  selectedPlan: Plan | null;
  subscriptions: Subscription[];
  onTabChange: (value: string) => void;
  onPlanSelect: (plan: Plan) => void;
  onRenewSubscription: (subscription: Subscription) => void;
  onSelectCommunity: (community: any) => void;
  refreshSubscriptions: () => void;
}

export const MainTabs = ({
  community,
  activeTab,
  selectedPlan,
  subscriptions,
  onTabChange,
  onPlanSelect,
  onRenewSubscription,
  onSelectCommunity,
  refreshSubscriptions
}: MainTabsProps) => {
  const handleTabChange = (value: string) => {
    onTabChange(value);
    triggerHapticFeedback('selection');
  };

  const handlePlanSelect = (plan: Plan) => {
    onPlanSelect(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
    triggerHapticFeedback('selection');
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    onRenewSubscription(subscription);
    triggerHapticFeedback('selection');
  };

  const handleSelectCommunity = (selectedCommunity: any) => {
    onSelectCommunity(selectedCommunity);
    triggerHapticFeedback('selection');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <ContentTabs
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        communitySubscriptionPlans={community.subscription_plans}
        selectedPlan={selectedPlan}
        onPlanSelect={handlePlanSelect}
        showPaymentMethods={!!selectedPlan}
        subscriptions={subscriptions}
        onRefreshSubscriptions={refreshSubscriptions}
        onRenewSubscription={handleRenewSubscription}
        onSelectCommunity={handleSelectCommunity}
      />
    </motion.div>
  );
};
