
import React from "react";
import { SelectItem } from "@/components/ui/select";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { FolderKanban } from "lucide-react";

interface GroupSelectItemProps {
  group: CommunityGroup;
  value: string;
}

export const GroupSelectItem: React.FC<GroupSelectItemProps> = ({
  group,
  value
}) => {
  return (
    <SelectItem value={value} className="p-1">
      <div className="flex items-center gap-2 relative group">
        <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 rounded-md flex items-center justify-center">
          <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
        </div>
        <span className="text-xs truncate">{group.name}</span>
      </div>
    </SelectItem>
  );
};
