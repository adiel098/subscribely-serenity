
import React from "react";
import { ChevronDown } from "lucide-react";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { FolderKanban } from "lucide-react";

interface GroupSelectedDisplayProps {
  group: CommunityGroup | undefined;
}

export const GroupSelectedDisplay: React.FC<GroupSelectedDisplayProps> = ({
  group
}) => {
  if (!group) {
    return (
      <div className="flex items-center">
        <span className="text-gray-400 text-sm">Select community</span>
        <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 rounded-md flex items-center justify-center">
        <FolderKanban className="h-4 w-4 text-indigo-600" />
      </div>
      <span className="font-medium text-gray-800 text-sm truncate">{group.name}</span>
      <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
    </div>
  );
};
