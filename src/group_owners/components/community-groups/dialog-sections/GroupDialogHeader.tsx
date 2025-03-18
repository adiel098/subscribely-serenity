
import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, PenSquare } from "lucide-react";

interface GroupDialogHeaderProps {
  isEditing: boolean;
  groupName: string;
}

export const GroupDialogHeader: React.FC<GroupDialogHeaderProps> = ({
  isEditing,
  groupName,
}) => {
  return (
    <DialogHeader className="pb-2">
      <DialogTitle className="text-xl font-semibold flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2 text-purple-600">
            <PenSquare className="h-5 w-5" />
            <span>Edit Group Details</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>{groupName}</span>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 ml-2">
              Group
            </Badge>
          </>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};
