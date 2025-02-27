
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface SubscriptionStatusProps {
  isActive: boolean;
  daysRemaining: number;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  isActive,
  daysRemaining,
}) => {
  if (isActive && daysRemaining < 7) {
    return (
      <div className="mt-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-sm flex items-center">
        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
        <span>Expiring soon! Only {daysRemaining} days remaining</span>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="mt-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md text-sm flex items-center">
        <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
        <span>Your subscription has expired</span>
      </div>
    );
  }

  return null;
};
