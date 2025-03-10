
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, Clock, ExternalLink, RefreshCw, XCircle, Zap, Users } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, isSubscriptionActive, getDaysRemaining } from "./utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MembershipCardProps {
  subscription: Subscription;
  onCancelClick: (subscription: Subscription) => void;
  onRenew: (subscription: Subscription) => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  subscription,
  onCancelClick,
  onRenew,
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const active = isSubscriptionActive(subscription);
  const daysRemaining = getDaysRemaining(subscription);
  const isExpiringSoon = active && daysRemaining <= 3;

  const handleCommunityLink = () => {
    if (subscription.community.telegram_invite_link) {
      window.open(subscription.community.telegram_invite_link, "_blank");
    }
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem 
          value={subscription.id} 
          className={`border rounded-lg overflow-hidden mb-3 ${
            isExpiringSoon 
              ? "border-red-300 bg-red-50/30" 
              : active 
                ? "border-primary/20" 
                : "border-gray-200"
          }`}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
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
                    <Badge variant={active ? "success" : "outline"} className="text-xs px-1.5 py-0">
                      {active ? "Active" : "Expired"}
                    </Badge>
                    {subscription.plan && (
                      <span className="text-xs text-gray-500">
                        {subscription.plan.name} · {subscription.plan.interval}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {active && (
                <div className={`text-[10px] scale-90 whitespace-nowrap font-medium ${isExpiringSoon ? "text-red-500" : "text-primary"}`}>
                  {daysRemaining} days left
                </div>
              )}
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            <div className="text-sm space-y-4">
              {/* Description has been removed as requested */}
              
              <div className="flex justify-between text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Started: {formatDate(subscription.subscription_start_date || subscription.joined_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Ends: {formatDate(subscription.subscription_end_date || subscription.expiry_date)}</span>
                </div>
              </div>
              
              {/* Styled Community Link Button */}
              {subscription.community.telegram_invite_link && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 hover:text-purple-800 border border-purple-200 transition-all duration-300"
                  onClick={handleCommunityLink}
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Visit Community ✨
                </Button>
              )}
              
              {/* Action Buttons Row */}
              <div className="flex gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancel 🚫
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-100"
                  onClick={() => onRenew(subscription)}
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Renew 🔄
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              This will cancel your subscription to{" "}
              <span className="font-medium">{subscription.community.name}</span>. You'll
              still have access to the community until your current subscription period ends
              on {formatDate(subscription.subscription_end_date || subscription.expiry_date)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="sm:order-1">
              Keep Subscription
            </Button>
            <Button 
              variant="default" 
              className="bg-red-600 hover:bg-red-700 text-white sm:order-2"
              onClick={() => {
                onCancelClick(subscription);
                setCancelDialogOpen(false);
              }}
            >
              Yes, Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
