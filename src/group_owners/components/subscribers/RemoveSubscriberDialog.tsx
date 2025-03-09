
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
import { Loader2 } from "lucide-react";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface RemoveSubscriberDialogProps {
  subscriber: Subscriber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (subscriber: Subscriber) => void;
  isProcessing: boolean;
}

export const RemoveSubscriberDialog = ({
  subscriber,
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: RemoveSubscriberDialogProps) => {
  if (!subscriber) return null;

  // Handler for confirm button with better event handling
  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (subscriber && !isProcessing) {
      onConfirm(subscriber);
    }
  };

  // Safe cancel handler
  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isProcessing) {
      onOpenChange(false);
    }
  };

  // Safe dialog change handler
  const safeDialogChange = (value: boolean) => {
    if (!isProcessing || !value) {
      onOpenChange(value);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={safeDialogChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Subscriber</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">
              {subscriber.telegram_username
                ? `@${subscriber.telegram_username}`
                : subscriber.telegram_user_id}
            </span>{" "}
            from your group? This will cancel their subscription and they will be kicked from the Telegram group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isProcessing} 
            onClick={handleCancel}
            className="z-10"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClick}
            disabled={isProcessing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
