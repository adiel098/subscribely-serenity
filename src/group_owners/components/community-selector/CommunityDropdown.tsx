
import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePhotos } from "@/group_owners/hooks/usePhotos";
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { CommunitySelectItem } from "./dropdown-items/CommunitySelectItem";
import { CommunitySelectedDisplay } from "./dropdown-items/CommunitySelectedDisplay";
import { GroupSelectItem } from "./dropdown-items/GroupSelectItem";
import { GroupSelectedDisplay } from "./dropdown-items/GroupSelectedDisplay";
import { getProxiedImageUrl } from "@/admin/services/imageProxyService";

interface CommunityDropdownProps {
  communities: Community[] | undefined;
  groups: CommunityGroup[] | undefined;
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
}

export const CommunityDropdown: React.FC<CommunityDropdownProps> = ({
  communities,
  groups,
  selectedCommunityId,
  setSelectedCommunityId,
  selectedGroupId,
  setSelectedGroupId
}) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [selectedType, setSelectedType] = useState<'community' | 'group' | null>(null);
  const { getPhotoUrl, refreshPhoto, isRefreshing, lastUpdate } = usePhotos();
  
  const selectedCommunity = communities?.find(community => community.id === selectedCommunityId);
  const selectedGroup = groups?.find(group => group.id === selectedGroupId);
  
  // Get the photo URL and proxy it for proper display
  let communityPhotoUrl = selectedCommunity ? getPhotoUrl(selectedCommunity.id) : undefined;
  const proxiedPhotoUrl = communityPhotoUrl ? getProxiedImageUrl(communityPhotoUrl) : undefined;
  
  // When prop values change, update internal state
  useEffect(() => {
    if (selectedCommunityId) {
      setSelectedValue(`community-${selectedCommunityId}`);
      setSelectedType('community');
    } else if (selectedGroupId) {
      setSelectedValue(`group-${selectedGroupId}`);
      setSelectedType('group');
    } else {
      setSelectedValue("");
      setSelectedType(null);
    }
  }, [selectedCommunityId, selectedGroupId]);
  
  // Force render when photos are updated
  useEffect(() => {
    // This is intentionally empty but the dependency on lastUpdate 
    // will trigger a re-render when photos change
    console.log("Photos lastUpdate:", lastUpdate);
  }, [lastUpdate]);
  
  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    
    if (value.startsWith("community-")) {
      const communityId = value.replace("community-", "");
      setSelectedCommunityId(communityId);
      setSelectedGroupId(null);
      setSelectedType('community');
    } else if (value.startsWith("group-")) {
      const groupId = value.replace("group-", "");
      setSelectedGroupId(groupId);
      setSelectedCommunityId(null);
      setSelectedType('group');
    }
  };
  
  // This function handles the photo refresh, properly forwarding arguments
  const handleRefreshPhoto = (e: React.MouseEvent, communityId: string, chatId?: string | null) => {
    e.stopPropagation();
    refreshPhoto(communityId, chatId);
  };
  
  return (
    <div className="w-[260px]">
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue>
            {selectedType === 'community' && selectedCommunity ? (
              <CommunitySelectedDisplay
                key={`selected-${selectedCommunity.id}-${communityPhotoUrl}-${lastUpdate}`}
                community={selectedCommunity}
                photoUrl={communityPhotoUrl}
                isRefreshing={isRefreshing}
                onRefreshPhoto={handleRefreshPhoto}
              />
            ) : selectedType === 'group' && selectedGroup ? (
              <GroupSelectedDisplay
                group={selectedGroup}
              />
            ) : (
              <div className="flex items-center">
                <span className="text-gray-400 text-xs">Select community or group</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="max-h-[300px]">
          {groups && groups.length > 0 && (
            <div className="px-2 py-1">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Groups</h3>
              <div className="space-y-0.5">
                {groups.map(group => (
                  <GroupSelectItem
                    key={group.id}
                    group={group}
                    value={`group-${group.id}`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {communities && communities.length > 0 && (
            <div className="px-2 py-1">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Communities</h3>
              <div className="space-y-0.5">
                {communities.filter(community => !community.is_group).map(community => {
                  const photoUrl = getPhotoUrl(community.id);
                  return (
                    <CommunitySelectItem 
                      key={`item-${community.id}-${photoUrl}-${lastUpdate}`}
                      community={community}
                      photoUrl={photoUrl}
                      isRefreshing={isRefreshing}
                      onRefreshPhoto={handleRefreshPhoto}
                      value={`community-${community.id}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
          
          {(!communities || communities.length === 0) && (!groups || groups.length === 0) && (
            <div className="px-2 py-3 text-center">
              <p className="text-xs text-gray-500">No communities or groups found</p>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
