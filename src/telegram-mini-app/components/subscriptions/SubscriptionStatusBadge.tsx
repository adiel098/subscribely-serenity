
import React from "react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionStatusBadgeProps {
  isActive: boolean;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  isActive,
}) => {
  return (
    <Badge variant={isActive ? "success" : "outline"} className="ml-2">
      {isActive ? "Active" : "Expired"}
    </Badge>
  );
};
