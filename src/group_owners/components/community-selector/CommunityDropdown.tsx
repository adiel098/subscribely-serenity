
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { Community } from "../../hooks/useCommunities";

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

  return (
    <div className="flex items-center gap-3 bg-white py-1 px-3 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xs text-gray-500 font-medium">COMMUNITY</p>
          <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-[200px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
              <div className="flex items-center gap-2">
                {selectedCommunity ? (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={selectedCommunity.telegram_photo_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                        {selectedCommunity.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-800 text-sm truncate">{selectedCommunity.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">Select community</span>
                )}
                <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {communities?.map(community => (
                <SelectItem key={community.id} value={community.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={community.telegram_photo_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                        {community.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{community.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
