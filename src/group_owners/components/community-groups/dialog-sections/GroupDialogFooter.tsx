
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Edit, Save, X } from "lucide-react";

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
    <DialogFooter className="gap-2 sm:gap-0">
      {isEditing ? (
        <>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700"
            disabled={isPending || !isFormValid}
          >
            {isPending ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
            className="text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <Button 
            onClick={onEdit}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Group
          </Button>
        </>
      )}
    </DialogFooter>
  );
};
