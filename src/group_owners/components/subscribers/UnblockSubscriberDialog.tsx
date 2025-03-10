
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
import { Loader2, Unlock } from "lucide-react";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface UnblockSubscriberDialogProps {
  subscriber: Subscriber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (subscriber: Subscriber) => void;
  isProcessing: boolean;
}

export const UnblockSubscriberDialog = ({
  subscriber,
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: UnblockSubscriberDialogProps) => {
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
          <AlertDialogTitle>Unblock Subscriber</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unblock{" "}
            <span className="font-semibold">
              {subscriber.telegram_username
                ? `@${subscriber.telegram_username}`
                : subscriber.telegram_user_id}
            </span>?
            This will change their status to "inactive" and allow them to subscribe again to your community.
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
            className="bg-blue-600 text-white hover:bg-blue-700 z-10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unblocking...
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Unblock
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
