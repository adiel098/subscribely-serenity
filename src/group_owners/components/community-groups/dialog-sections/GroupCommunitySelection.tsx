
import React, { useState } from "react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Users, CheckCircle2, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter communities based on search
  const filteredCommunities = allCommunities.filter(community => 
    !community.is_group && // Don't include other groups
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get currently selected communities
  const selectedCommunities = filteredCommunities.filter(c => 
    selectedCommunityIds.includes(c.id)
  );
  
  // Get available communities that are not yet selected
  const availableCommunities = filteredCommunities.filter(c => 
    !selectedCommunityIds.includes(c.id)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Selected Communities */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Selected Communities ({selectedCommunities.length})
            </h3>
            {selectedCommunities.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-md bg-gray-50 text-center">
                No communities selected for this group yet ✨
              </p>
            ) : (
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {selectedCommunities.map(community => (
                    <div key={community.id} className="flex items-center space-x-2 p-2 border rounded-md bg-purple-50 hover:bg-purple-100 transition-colors">
                      <Checkbox 
                        id={`selected-${community.id}`}
                        checked={true}
                        onCheckedChange={() => toggleCommunity(community.id)}
                        className="text-purple-600 border-purple-400"
                      />
                      <label 
                        htmlFor={`selected-${community.id}`}
                        className="text-sm font-medium flex-grow cursor-pointer"
                      >
                        {community.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {/* Available Communities */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4 text-blue-500" />
              Available Communities ({availableCommunities.length})
            </h3>
            {availableCommunities.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-md bg-gray-50 text-center">
                {searchQuery ? "No communities match your search 🔍" : "No more communities available 🎉"}
              </p>
            ) : (
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {availableCommunities.map(community => (
                    <div key={community.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox 
                        id={`available-${community.id}`}
                        checked={false}
                        onCheckedChange={() => toggleCommunity(community.id)}
                      />
                      <label 
                        htmlFor={`available-${community.id}`}
                        className="text-sm font-medium flex-grow cursor-pointer"
                      >
                        {community.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
