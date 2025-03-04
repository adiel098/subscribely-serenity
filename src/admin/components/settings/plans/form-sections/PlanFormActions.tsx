
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, X } from "lucide-react";

interface PlanFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitText: string;
}

export const PlanFormActions = ({ isSubmitting, onCancel, submitText }: PlanFormActionsProps) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="gap-1"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-indigo-600 hover:bg-indigo-700 gap-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {submitText}
      </Button>
    </DialogFooter>
  );
};
