
import React from "react";
import { UserSubscriptions } from "@/telegram-mini-app/components/UserSubscriptions";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { Plan } from "@/telegram-mini-app/types/community.types";

interface SubscriptionsTabContentProps {
  subscriptions: Subscription[];
  onRefresh: () => void;
  onRenew: (subscription: Subscription) => void;
}

export const SubscriptionsTabContent: React.FC<SubscriptionsTabContentProps> = ({
  subscriptions,
  onRefresh,
  onRenew
}) => {
  return (
    <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
      <UserSubscriptions 
        subscriptions={subscriptions} 
        onRefresh={onRefresh}
        onRenew={onRenew}
      />
    </div>
  );
};
