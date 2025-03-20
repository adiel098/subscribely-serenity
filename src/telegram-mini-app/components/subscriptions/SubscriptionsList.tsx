
import React from "react";
import { Subscription } from "../../services/memberService";
import { MembershipCard } from "./MembershipCard";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("SubscriptionsList");

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
  // Log the subscriptions to help debug
  React.useEffect(() => {
    logger.log(`Rendering ${subscriptions.length} subscriptions:`);
    subscriptions.forEach((sub, index) => {
      logger.log(`Subscription ${index + 1}:`, {
        id: sub.id,
        communityId: sub.community_id,
        communityName: sub.community?.name,
        hasInviteLink: !!sub.community?.telegram_invite_link
      });
    });
  }, [subscriptions]);

  return (
    <div className="grid gap-2">
      {subscriptions.map((subscription) => (
        <MembershipCard
          key={subscription.id}
          subscription={subscription}
          onCancelClick={onCancelClick}
          onRenew={onRenew}
        />
      ))}
    </div>
  );
};
