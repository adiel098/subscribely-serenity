
import React from "react";
import { Users } from "lucide-react";
import { MembershipStatusBadge } from "./MembershipStatusBadge";
import { Subscription } from "../../../services/memberService";
import { isSubscriptionActive, getTimeRemainingText, getDaysRemaining } from "../utils";

interface MembershipHeaderProps {
  subscription: Subscription;
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({
  subscription
}) => {
  const active = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);
  const isExpiringSoon = active && daysRemaining <= 3;
  const timeRemainingText = getTimeRemainingText(subscription);

  return (
    <div className="flex items-start justify-between w-full text-left">
      <div className="flex items-center gap-3">
        {subscription.community.telegram_photo_url ? (
          <img 
            src={subscription.community.telegram_photo_url} 
            alt={subscription.community.name} 
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-base">{subscription.community.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <MembershipStatusBadge subscription={subscription} />
            {subscription.plan && (
              <span className="text-xs text-gray-500">
                {subscription.plan.name} · {subscription.plan.interval}
              </span>
            )}
          </div>
        </div>
      </div>
      {active && (
        <div className={`text-xs font-medium whitespace-nowrap ${isExpiringSoon ? "text-red-500" : "text-primary"}`}>
          {timeRemainingText}
        </div>
      )}
    </div>
  );
};
