
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
import { Loader2, Unlock, UserCheck } from "lucide-react";
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
      <AlertDialogContent 
        onClick={(e) => e.stopPropagation()}
        className="border-blue-100 bg-white"
      >
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="h-24 w-24 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center shadow-sm">
            <UserCheck className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <AlertDialogHeader className="mt-8 text-center">
          <AlertDialogTitle className="text-xl font-bold text-gray-900">Unblock Subscriber</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600">
            <p className="mb-2">
              Are you sure you want to unblock{" "}
              <span className="font-semibold text-gray-900">
                {subscriber.telegram_username
                  ? `@${subscriber.telegram_username}`
                  : subscriber.telegram_user_id}
              </span>?
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2 text-sm text-blue-800">
              <Unlock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                This will change their status to <strong>inactive</strong> and allow them to subscribe again to your community. They will need to purchase a subscription to regain access.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2 sm:space-x-0">
          <AlertDialogCancel 
            disabled={isProcessing} 
            onClick={handleCancel}
            className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 sm:w-32"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClick}
            disabled={isProcessing}
            className="bg-blue-600 text-white hover:bg-blue-700 sm:w-32"
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
