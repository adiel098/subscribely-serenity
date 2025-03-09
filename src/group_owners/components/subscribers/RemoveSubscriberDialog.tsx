
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
import { useEffect } from "react";

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

  // Prevent event propagation to stop the dialog from interfering with the page after closing
  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm(subscriber);
  };

  // Handle dialog cancel more safely
  const handleCancel = () => {
    if (!isProcessing) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
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
          <AlertDialogCancel disabled={isProcessing} onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClick}
            disabled={isProcessing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
