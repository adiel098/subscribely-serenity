
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Community } from "../../hooks/useCommunities";
import { useCommunityPhotos } from "./photo-handling/useCommunityPhotos";
import { CommunitySelectItem } from "./dropdown-items/CommunitySelectItem";
import { CommunitySelectedDisplay } from "./dropdown-items/CommunitySelectedDisplay";

interface CommunityDropdownProps {
  communities?: Community[];
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string) => void;
}

export const CommunityDropdown = ({ 
  communities, 
  selectedCommunityId, 
  setSelectedCommunityId 
}: CommunityDropdownProps) => {
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  
  const {
    refreshingCommunityId,
    handleRefreshPhoto,
    getPhotoUrl
  } = useCommunityPhotos(communities);

  return (
    <div className="flex items-center gap-3 bg-white py-1 px-3 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xs text-gray-500 font-medium">COMMUNITY</p>
          <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-[200px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
              <CommunitySelectedDisplay
                community={selectedCommunity}
                photoUrl={selectedCommunity ? getPhotoUrl(selectedCommunity.id) : undefined}
                isRefreshing={selectedCommunity?.id === refreshingCommunityId}
                onRefreshPhoto={handleRefreshPhoto}
              />
            </SelectTrigger>
            <SelectContent>
              {communities?.map(community => (
                <CommunitySelectItem
                  key={community.id}
                  community={community}
                  photoUrl={getPhotoUrl(community.id)}
                  isRefreshing={community.id === refreshingCommunityId}
                  onRefreshPhoto={handleRefreshPhoto}
                />
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
