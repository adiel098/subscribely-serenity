
import React from "react";
import { Subscription } from "@/telegram-mini-app/services/types/memberTypes";
import { Zap, Crown, Trash, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import { SubscriptionDates } from "./SubscriptionDates";
import { SubscriptionStatus } from "./SubscriptionStatus";

interface SubscriptionCardProps {
  subscription: Subscription;
  onRenew: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onRenew,
  onCancel,
}) => {
  const isActive = () => {
    if (!subscription.subscription_end_date && !subscription.expiry_date) return false;
    const endDate = subscription.subscription_end_date || subscription.expiry_date;
    return endDate ? new Date(endDate) > new Date() : false;
  };

  const getDaysRemaining = () => {
    const endDate = subscription.subscription_end_date || subscription.expiry_date;
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const active = isActive();
  const daysRemaining = getDaysRemaining();

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${active ? "border-primary/30" : "border-gray-200 opacity-75"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
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
              <CardTitle className="text-lg">{subscription.community.name}</CardTitle>
              {subscription.plan && (
                <CardDescription className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {subscription.plan.name} - ${subscription.plan.price}/{subscription.plan.interval}
                </CardDescription>
              )}
            </div>
          </div>
          <SubscriptionStatusBadge isActive={active} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 text-sm">
        <SubscriptionDates 
          startDate={subscription.subscription_start_date}
          endDate={subscription.subscription_end_date}
          createdAt={subscription.created_at}
          expiryDate={subscription.expiry_date}
        />
        
        <SubscriptionStatus isActive={active} daysRemaining={daysRemaining} />
      </CardContent>
      
      <CardFooter className="pt-2">
        {active ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onCancel(subscription)}
            >
              <Trash className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            {daysRemaining < 14 && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onRenew(subscription)}
              >
                <Zap className="h-4 w-4 mr-1.5" />
                Renew
              </Button>
            )}
          </div>
        ) : (
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onRenew(subscription)}
          >
            <Zap className="h-4 w-4 mr-1.5" />
            Reactivate Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
