
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CommunityItemProps } from "./types";

export const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  isSelected,
  onToggle
}) => {
  return (
    <div 
      key={community.id} 
      className="flex items-center space-x-2 border p-2 rounded-md"
    >
      <Checkbox 
        id={`community-${community.id}`}
        checked={isSelected}
        onCheckedChange={() => onToggle(community.id)}
      />
      <label 
        htmlFor={`community-${community.id}`}
        className="text-sm font-medium flex-grow cursor-pointer"
      >
        {community.name}
      </label>
    </div>
  );
};
