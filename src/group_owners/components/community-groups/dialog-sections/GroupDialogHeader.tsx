
import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface GroupDialogHeaderProps {
  isEditing: boolean;
  groupName: string;
}

export const GroupDialogHeader: React.FC<GroupDialogHeaderProps> = ({
  isEditing,
  groupName,
}) => {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold flex items-center gap-2">
        {isEditing ? (
          <span className="text-purple-600">Edit Group Details</span>
        ) : (
          <>
            {groupName}
            <Badge variant="outline" className="bg-purple-50 text-purple-700 ml-2">
              Group
            </Badge>
          </>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};
