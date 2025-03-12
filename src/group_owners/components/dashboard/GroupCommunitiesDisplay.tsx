
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Users, MessageCircle } from "lucide-react";

interface GroupCommunitiesDisplayProps {
  communities: Community[];
}

export const GroupCommunitiesDisplay: React.FC<GroupCommunitiesDisplayProps> = ({ communities }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-800">Communities in this Group</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {communities && communities.length > 0 ? (
          communities.map(community => (
            <Card key={community.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="px-4 py-3 pb-0">
                <CardTitle className="text-sm font-medium truncate">{community.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{community.member_count || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                    <span>{community.subscription_count || 0} subscribers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-gray-500 col-span-full p-4">No communities in this group</p>
        )}
      </div>
    </div>
  );
};
