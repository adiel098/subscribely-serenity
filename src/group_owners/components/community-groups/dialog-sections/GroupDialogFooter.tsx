
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface GroupDialogFooterProps {
  isEditing: boolean;
  isPending: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const GroupDialogFooter: React.FC<GroupDialogFooterProps> = ({
  isEditing,
  isPending,
  isFormValid,
  onClose,
  onEdit,
  onSave,
  onCancel
}) => {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      {isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!isFormValid || isPending}
            className="min-w-[100px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>Edit Group</Button>
        </>
      )}
    </DialogFooter>
  );
};
