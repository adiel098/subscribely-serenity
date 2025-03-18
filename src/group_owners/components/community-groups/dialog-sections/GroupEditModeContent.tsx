
import React from "react";
import { GroupPropertyEditSection } from "../GroupPropertyEditSection";
import { GroupCommunitySelection } from "./GroupCommunitySelection";
import { GroupDialogTabs } from "./GroupDialogTabs";
import { Community } from "@/group_owners/hooks/useCommunities";

interface GroupEditModeContentProps {
  activeTab: 'details' | 'communities';
  setActiveTab: (tab: 'details' | 'communities') => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  photoUrl: string;
  setPhotoUrl: (photoUrl: string) => void;
  customLink: string;
  setCustomLink: (customLink: string) => void;
  allCommunities: Community[] | undefined;
  selectedCommunityIds: string[];
  toggleCommunity: (communityId: string) => void;
  isLoadingCommunities: boolean;
}

export const GroupEditModeContent: React.FC<GroupEditModeContentProps> = ({
  activeTab,
  setActiveTab,
  name,
  setName,
  description,
  setDescription,
  photoUrl,
  setPhotoUrl,
  customLink,
  setCustomLink,
  allCommunities,
  selectedCommunityIds,
  toggleCommunity,
  isLoadingCommunities
}) => {
  return (
    <div className="space-y-4">
      <GroupDialogTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'details' ? (
        <GroupPropertyEditSection 
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          customLink={customLink}
          setCustomLink={setCustomLink}
        />
      ) : (
        <GroupCommunitySelection
          allCommunities={allCommunities?.filter(c => !c.is_group) || []}
          selectedCommunityIds={selectedCommunityIds}
          toggleCommunity={toggleCommunity}
          isLoading={isLoadingCommunities}
        />
      )}
    </div>
  );
};
