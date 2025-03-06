
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, X } from "lucide-react";

interface DialogFooterActionsProps {
  isUpdating: boolean;
  onCancel: () => void;
}

export const DialogFooterActions = ({ isUpdating, onCancel }: DialogFooterActionsProps) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={isUpdating}
      >
        <X className="mr-2 h-4 w-4" /> Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isUpdating}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </>
        )}
      </Button>
    </DialogFooter>
  );
};
