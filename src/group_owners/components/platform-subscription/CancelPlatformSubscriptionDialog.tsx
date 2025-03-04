
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deactivateSubscription } from "@/group_owners/services/platformPaymentService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CancelPlatformSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  subscriptionEndDate: string;
  onCancellationSuccess: () => void;
}

export const CancelPlatformSubscriptionDialog = ({ 
  open, 
  onOpenChange, 
  subscriptionId,
  subscriptionEndDate,
  onCancellationSuccess
}: CancelPlatformSubscriptionDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = new Date(subscriptionEndDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const handleCancel = async () => {
    setIsProcessing(true);
    
    try {
      const success = await deactivateSubscription(subscriptionId);
      
      if (success) {
        toast({
          title: "Subscription Cancelled",
          description: `Your subscription has been cancelled and will remain active until ${formattedDate}.`,
        });
        onCancellationSuccess();
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Platform Subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will remain active until <span className="font-semibold">{formattedDate}</span>, after which it will be cancelled. You will lose access to platform features when your subscription ends.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancel}
            disabled={isProcessing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Cancel Subscription"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
