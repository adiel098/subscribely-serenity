
import React from "react";
import { ChevronDown, FolderKanban } from "lucide-react";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";

interface GroupSelectedDisplayProps {
  group: CommunityGroup | undefined;
}

export const GroupSelectedDisplay: React.FC<GroupSelectedDisplayProps> = ({
  group
}) => {
  if (!group) {
    return (
      <div className="flex items-center">
        <span className="text-gray-400 text-xs">Select community</span>
        <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0 h-5 w-5 bg-indigo-100 rounded-md flex items-center justify-center">
        <FolderKanban className="h-3 w-3 text-indigo-600" />
      </div>
      <span className="font-medium text-gray-800 text-xs truncate">{group.name}</span>
      <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
    </div>
  );
};
