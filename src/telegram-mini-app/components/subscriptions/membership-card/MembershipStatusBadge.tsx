
import React from "react";
import { Badge } from "@/components/ui/badge";
import { isSubscriptionActive } from "../utils";
import { Subscription } from "../../../services/memberService";

interface MembershipStatusBadgeProps {
  subscription: Subscription;
}

export const MembershipStatusBadge: React.FC<MembershipStatusBadgeProps> = ({ 
  subscription 
}) => {
  const active = isSubscriptionActive(subscription);
  
  return (
    <Badge variant={active ? "success" : "outline"} className="text-xs px-1.5 py-0">
      {active ? "Active" : "Expired"}
    </Badge>
  );
};
