
import React from "react";
import { cancelSubscription, Subscription } from "../../services/memberService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onRefresh: () => void;
  toast: any;
}

export const CancelSubscriptionDialog: React.FC<CancelSubscriptionDialogProps> = ({
  open,
  onOpenChange,
  subscription,
  isLoading,
  setIsLoading,
  onRefresh,
  toast,
}) => {
  const handleCancelConfirm = async () => {
    if (!subscription) return;
    
    setIsLoading(true);
    try {
      await cancelSubscription(subscription.id);
      toast({
        title: "Subscription cancelled",
        description: `You've successfully cancelled your subscription to ${subscription.community.name}`,
        variant: "default",
      });
      onRefresh();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel your subscription to{" "}
            <span className="font-medium">{subscription?.community.name}</span>. You'll
            lose access when your current period ends.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancelConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Subscription"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
