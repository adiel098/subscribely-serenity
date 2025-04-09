
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Users, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GroupCommunitiesDisplayProps {
  communities: Community[];
}

export const GroupCommunitiesDisplay: React.FC<GroupCommunitiesDisplayProps> = ({ communities }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-3">
      <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium text-gray-800`}>Communities in this Project</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {communities && communities.length > 0 ? (
          communities.map(community => (
            <Card key={community.id} className="shadow-sm hover:shadow-md transition-shadow h-full">
              <CardHeader className={`${isMobile ? 'px-2 py-2 pb-0' : 'px-4 py-3 pb-0'}`}>
                <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium truncate`}>{community.name}</CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'}`}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-indigo-500`} />
                    <span className={isMobile ? 'text-[10px]' : ''}>{community.member_count || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageCircle className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-blue-500`} />
                    <span className={isMobile ? 'text-[10px]' : ''}>{community.subscription_count || 0} subs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className={`text-sm text-gray-500 col-span-full ${isMobile ? 'p-2 text-xs' : 'p-4'}`}>No communities in this project</p>
        )}
      </div>
    </div>
  );
};
