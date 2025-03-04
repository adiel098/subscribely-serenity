
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

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
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-indigo-600 hover:bg-indigo-700"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitText}
      </Button>
    </DialogFooter>
  );
};
