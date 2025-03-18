
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, Edit, Check } from "lucide-react";

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
  if (isEditing) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-gray-600"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isPending || !isFormValid}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        className="text-gray-600"
      >
        <X className="h-4 w-4 mr-1" />
        Close
      </Button>
      
      <Button
        onClick={onEdit}
        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit Group
      </Button>
    </div>
  );
};
