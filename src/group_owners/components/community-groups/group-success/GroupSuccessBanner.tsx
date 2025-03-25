
import React from "react";
import { SuccessBanner } from "@/group_owners/components/community-selector/banners/SuccessBanner";

interface GroupSuccessBannerProps {
  groupId: string;
  customLink: string | null;
  onOpenEditDialog: () => void;
}

export const GroupSuccessBanner: React.FC<GroupSuccessBannerProps> = ({
  groupId,
  customLink,
  onOpenEditDialog,
}) => {
  return (
    <SuccessBanner
      communityId={groupId}
      customLink={customLink}
      onOpenEditDialog={onOpenEditDialog}
      entityType="group"
    />
  );
};
