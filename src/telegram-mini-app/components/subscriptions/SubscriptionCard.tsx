
import React from "react";
import { Calendar, Clock, CheckCircle, XCircle, Zap, Crown, Trash, Users } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, isSubscriptionActive, getDaysRemaining } from "./utils";

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
  const active = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);

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
          <Badge variant={active ? "success" : "outline"} className="ml-2">
            {active ? "Active" : "Expired"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 text-sm">
        <div className="flex justify-between text-muted-foreground mb-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Started: {formatDate(subscription.subscription_start_date || subscription.joined_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Ends: {formatDate(subscription.subscription_end_date || subscription.expiry_date)}</span>
          </div>
        </div>
        
        {active && daysRemaining < 7 && (
          <div className="mt-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-sm flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Expiring soon! Only {daysRemaining} days remaining</span>
          </div>
        )}
        
        {!active && (
          <div className="mt-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md text-sm flex items-center">
            <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Your subscription has expired</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        {active ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onCancelClick(subscription)}
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
