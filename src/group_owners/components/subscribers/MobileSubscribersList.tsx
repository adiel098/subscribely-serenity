
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle, XCircle, User, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileSubscribersListProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock?: (subscriber: Subscriber) => void;
  onAssignPlan?: (subscriber: Subscriber) => void;
}

export const MobileSubscribersList: React.FC<MobileSubscribersListProps> = ({
  subscribers,
  onEdit,
  onRemove,
  onUnblock,
  onAssignPlan
}) => {
  if (subscribers.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No subscribers found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscribers.map((subscriber) => (
        <Card key={subscriber.id} className="p-3 shadow-sm subscribers-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-500" />
                <h3 className="font-medium text-sm">
                  {subscriber.telegram_username || 'No username'}
                </h3>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                <CalendarClock className="h-3 w-3" />
                <span>Joined: {formatDate(subscriber.joined_at)}</span>
              </div>
              
              {subscriber.subscription_status && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant={subscriber.subscription_status === 'active' ? "default" : "secondary"} className="text-[0.65rem] px-1.5 py-0.5">
                    {subscriber.subscription_status === 'active' ? (
                      <CheckCircle className="h-2.5 w-2.5 mr-1" />
                    ) : (
                      <XCircle className="h-2.5 w-2.5 mr-1" />
                    )}
                    {subscriber.subscription_status.charAt(0).toUpperCase() + subscriber.subscription_status.slice(1)}
                  </Badge>
                  
                  {subscriber.plan && (
                    <Badge variant="outline" className="text-[0.65rem] px-1.5 py-0.5">
                      <Shield className="h-2.5 w-2.5 mr-1" />
                      {subscriber.plan.name}
                    </Badge>
                  )}
                  
                  {subscriber.subscription_end_date && (
                    <Badge variant="outline" className="text-[0.65rem] px-1.5 py-0.5">
                      <Clock className="h-2.5 w-2.5 mr-1" />
                      Expires: {formatDate(subscriber.subscription_end_date)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-1.5 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(subscriber)}
              className="h-7 text-xs px-2"
            >
              Edit
            </Button>
            
            {!subscriber.subscription_status && onAssignPlan && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onAssignPlan(subscriber)}
                className="h-7 text-xs px-2"
              >
                Assign Plan
              </Button>
            )}
            
            {subscriber.subscription_status === 'active' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onRemove(subscriber)}
                className="h-7 text-xs px-2"
              >
                Remove
              </Button>
            )}
            
            {subscriber.subscription_status !== 'active' && onUnblock && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUnblock(subscriber)}
                className="h-7 text-xs px-2"
              >
                Unblock
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
