
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
import { Loader2, UserX, AlertTriangle } from "lucide-react";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
        className={`border-red-100 bg-white ${isMobile ? 'max-w-[90%] p-4' : ''}`}
      >
        <div className="mb-4 flex justify-center">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-red-50 flex items-center justify-center">
            <UserX className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" />
          </div>
        </div>
        
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Remove Subscriber</AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base text-gray-600">
            <p className="mb-2">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900">
                {subscriber.telegram_username
                  ? `@${subscriber.telegram_username}`
                  : subscriber.telegram_user_id}
              </span>{" "}
              from your group?
            </p>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2 text-xs sm:text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                This will cancel their subscription and remove them from the Telegram group.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={`sm:justify-center gap-2 sm:space-x-0 ${isMobile ? 'flex-col mt-4' : ''}`}>
          <AlertDialogCancel 
            disabled={isProcessing} 
            onClick={handleCancel}
            className={`border-gray-200 bg-white hover:bg-gray-50 text-gray-700 ${isMobile ? 'w-full' : 'sm:w-32'}`}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClick}
            disabled={isProcessing}
            className={`bg-red-600 text-white hover:bg-red-700 ${isMobile ? 'w-full' : 'sm:w-32'}`}
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
