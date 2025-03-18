
import { EditSubscriberDialog } from "./EditSubscriberDialog";
import { RemoveSubscriberDialog } from "./RemoveSubscriberDialog";
import { UnblockSubscriberDialog } from "./UnblockSubscriberDialog";
import { Subscriber } from "../../hooks/useSubscribers";

interface SubscriberDialogsProps {
  selectedSubscriber: any;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  subscriberToRemove: Subscriber | null;
  removeDialogOpen: boolean;
  handleRemoveDialogChange: (open: boolean) => void;
  subscriberToUnblock: Subscriber | null;
  unblockDialogOpen: boolean;
  handleUnblockDialogChange: (open: boolean) => void;
  onConfirmRemove: (subscriber: Subscriber) => void;
  onConfirmUnblock: (subscriber: Subscriber) => void;
  isRemoving: boolean;
  isUnblocking: boolean;
  onSuccess: () => void;
}

export const SubscriberDialogs = ({
  selectedSubscriber,
  editDialogOpen,
  setEditDialogOpen,
  subscriberToRemove,
  removeDialogOpen,
  handleRemoveDialogChange,
  subscriberToUnblock,
  unblockDialogOpen,
  handleUnblockDialogChange,
  onConfirmRemove,
  onConfirmUnblock,
  isRemoving,
  isUnblocking,
  onSuccess
}: SubscriberDialogsProps) => {
  return (
    <>
      {selectedSubscriber && (
        <EditSubscriberDialog
          subscriber={selectedSubscriber}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={onSuccess}
        />
      )}

      <RemoveSubscriberDialog
        subscriber={subscriberToRemove}
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogChange}
        onConfirm={onConfirmRemove}
        isProcessing={isRemoving}
      />

      <UnblockSubscriberDialog
        subscriber={subscriberToUnblock}
        open={unblockDialogOpen}
        onOpenChange={handleUnblockDialogChange}
        onConfirm={onConfirmUnblock}
        isProcessing={isUnblocking}
      />
    </>
  );
};
