
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
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { Loader2, UserX } from "lucide-react";

interface RemoveSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriber: Subscriber | null;
  onConfirm: (subscriber: Subscriber) => void;
  isProcessing: boolean;
}

export const RemoveSubscriberDialog = ({
  open,
  onOpenChange,
  subscriber,
  onConfirm,
  isProcessing,
}: RemoveSubscriberDialogProps) => {
  if (!subscriber) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Remove Subscriber
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium">
              {subscriber.telegram_username ? `@${subscriber.telegram_username}` : "this subscriber"}
            </span>{" "}
            from your community?
          </AlertDialogDescription>
          <AlertDialogDescription className="mt-2">
            This action will:
            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
              <li>Remove the user from your Telegram channel</li>
              <li>Mark their subscription status as "removed"</li>
              <li>Invalidate their invite link to prevent rejoining</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm(subscriber);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Subscriber"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
