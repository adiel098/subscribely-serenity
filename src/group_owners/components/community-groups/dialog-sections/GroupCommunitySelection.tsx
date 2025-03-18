
import React, { useState } from "react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Search, Loader2, Users } from "lucide-react";

interface GroupCommunitySelectionProps {
  allCommunities: Community[];
  selectedCommunityIds: string[];
  toggleCommunity: (id: string) => void;
  isLoading: boolean;
}

export const GroupCommunitySelection: React.FC<GroupCommunitySelectionProps> = ({
  allCommunities,
  selectedCommunityIds,
  toggleCommunity,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter communities based on search query
  const filteredCommunities = allCommunities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) && !community.is_group
  );
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Users className="h-4 w-4 text-purple-600" />
          Select Communities for this Group
        </h3>
        <p className="text-xs text-gray-500">
          Selected communities will appear in this group and be accessible to subscribers 🔑
        </p>
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search communities by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>
      
      {/* Community selection list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      ) : filteredCommunities.length > 0 ? (
        <div className="rounded-md border border-gray-200 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
          {filteredCommunities.map(community => (
            <div 
              key={community.id}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                selectedCommunityIds.includes(community.id) ? 'bg-purple-50' : ''
              }`}
            >
              <Checkbox
                id={`community-${community.id}`}
                checked={selectedCommunityIds.includes(community.id)}
                onCheckedChange={() => toggleCommunity(community.id)}
                className={selectedCommunityIds.includes(community.id) ? 'text-purple-600' : ''}
              />
              <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded-md overflow-hidden">
                {community.telegram_photo_url ? (
                  <img src={community.telegram_photo_url} alt={community.name} className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-5 w-5 text-gray-400 m-2" />
                )}
              </div>
              <label htmlFor={`community-${community.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-700">{community.name}</p>
                  {community.description && (
                    <p className="text-xs text-gray-500 truncate max-w-xs">{community.description}</p>
                  )}
                </div>
                {selectedCommunityIds.includes(community.id) && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No communities found matching your search 🔍</p>
        </div>
      )}
      
      {/* Selected communities counter */}
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium">{selectedCommunityIds.length}</span> communities selected
        </p>
        {selectedCommunityIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedCommunityIds.forEach(id => toggleCommunity(id))}
            className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Clear Selection
          </Button>
        )}
      </div>
    </div>
  );
};
