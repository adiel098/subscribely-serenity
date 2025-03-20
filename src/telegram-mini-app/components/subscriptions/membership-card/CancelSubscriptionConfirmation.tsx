
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Subscription } from "../../../services/memberService";
import { formatDate } from "../utils";

interface CancelSubscriptionConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription;
  onCancelConfirm: () => void;
}

export const CancelSubscriptionConfirmation: React.FC<CancelSubscriptionConfirmationProps> = ({
  open,
  onOpenChange,
  subscription,
  onCancelConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="sm:order-1"
          >
            Keep Subscription
          </Button>
          <Button 
            variant="default" 
            className="bg-red-600 hover:bg-red-700 text-white sm:order-2"
            onClick={onCancelConfirm}
          >
            Yes, Cancel Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
