
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";

export interface GroupMembersEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityGroup;
  currentCommunities: Community[];
  onCommunitiesUpdated: () => void;
}

export interface CommunityItemProps {
  community: Community;
  isSelected: boolean;
  onToggle: (id: string) => void;
}
