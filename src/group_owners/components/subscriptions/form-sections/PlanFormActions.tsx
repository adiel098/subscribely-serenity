
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, SaveIcon } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface PlanFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const PlanFormActions: React.FC<PlanFormActionsProps> = ({
  isSubmitting,
  onCancel,
}) => {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <SaveIcon className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </DialogFooter>
  );
};
