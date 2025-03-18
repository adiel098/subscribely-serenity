
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Edit, Save, X, Loader2 } from "lucide-react";

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
  onCancel,
}) => {
  return (
    <DialogFooter className="gap-2 sm:gap-0 mt-4 pt-4 border-t border-gray-100">
      {isEditing ? (
        <>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            disabled={isPending || !isFormValid}
          >
            {isPending ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <Button 
            onClick={onEdit}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Group
          </Button>
        </>
      )}
    </DialogFooter>
  );
};
