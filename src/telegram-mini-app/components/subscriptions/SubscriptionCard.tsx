
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Zap, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { motion } from "framer-motion";
import { ExpirationWarning } from "./ExpirationWarning";
import { MembershipStatusBadge } from "./membership-card/MembershipStatusBadge";
import { getDetailedTimeRemaining } from "@/utils/dateUtils";

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancelClick: (subscription: Subscription) => void;
  onRenew: (subscription: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onCancelClick,
  onRenew,
}) => {
  const isExpired = new Date(subscription.expiry_date) < new Date();
  const isActive = subscription.subscription_status === "active" || subscription.subscription_status === "trial";

  // Calculate time until expiry
  const expiryDate = new Date(subscription.expiry_date);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  
  // Get detailed time remaining
  const detailedTimeRemaining = getDetailedTimeRemaining(subscription.expiry_date);

  let statusIcon;
  if (isExpired) {
    statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
  } else if (isExpiringSoon) {
    statusIcon = <Clock className="h-5 w-5 text-amber-500" />;
  } else if (isActive) {
    statusIcon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  } else {
    statusIcon = <AlertCircle className="h-5 w-5 text-gray-400" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="subscription-card"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-900 flex items-center gap-1.5">
              {statusIcon}
              {subscription.community.name}
            </h3>
            
            <div className="flex gap-2 mt-1.5">
              <MembershipStatusBadge status={subscription.subscription_status} />
              
              {subscription.plan && (
                <Badge variant="outline" className="text-xs bg-indigo-50 border-indigo-100 text-indigo-600">
                  {subscription.plan.name}
                </Badge>
              )}
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
          <div className="text-xs text-gray-500">
            {isExpired ? (
              <span className="text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Expired
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {detailedTimeRemaining} remaining
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {isExpired && (
              <Button 
                size="sm" 
                variant="default"
                className="h-8 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => onRenew(subscription)}
              >
                <Zap className="h-3.5 w-3.5 mr-1" />
                Renew
              </Button>
            )}
            
            {(isActive || isExpiringSoon) && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => onCancelClick(subscription)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        {isExpiringSoon && <ExpirationWarning daysLeft={daysUntilExpiry} />}
      </div>
    </motion.div>
  );
};
