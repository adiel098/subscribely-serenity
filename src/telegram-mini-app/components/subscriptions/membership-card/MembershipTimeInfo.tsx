
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { Subscription } from "../../../services/memberService";
import { formatDate } from "../utils";
import { getDetailedTimeRemaining } from "@/utils/dateUtils";

interface MembershipTimeInfoProps {
  subscription: Subscription;
}

export const MembershipTimeInfo: React.FC<MembershipTimeInfoProps> = ({ 
  subscription 
}) => {
  const timeRemaining = getDetailedTimeRemaining(subscription.subscription_end_date || subscription.expiry_date);
  
  return (
    <div className="space-y-2 text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        <span>Started: {formatDate(subscription.subscription_start_date || subscription.joined_at)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        <span>Ends: {formatDate(subscription.subscription_end_date || subscription.expiry_date)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
        <Clock className="h-3.5 w-3.5" />
        <span>Remaining: {timeRemaining}</span>
      </div>
    </div>
  );
};
