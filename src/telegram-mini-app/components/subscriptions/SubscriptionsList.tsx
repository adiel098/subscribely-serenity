
import React from "react";
import { Subscription } from "../../services/memberService";
import { SubscriptionCard } from "./SubscriptionCard";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  onCancelClick: (subscription: Subscription) => void;
  onRenew: (subscription: Subscription) => void;
}

export const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
  subscriptions,
  onCancelClick,
  onRenew,
}) => {
  return (
    <div className="grid gap-4">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onCancelClick={onCancelClick}
          onRenew={onRenew}
        />
      ))}
    </div>
  );
};
