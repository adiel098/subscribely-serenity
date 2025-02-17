
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink, Users, DollarSign } from "lucide-react";

interface Community {
  id: string;
  name: string;
  platform: string;
  member_count: number;
  subscription_count: number;
  subscription_revenue: number;
  platform_id: string | null;
  telegram_chat_id: string | null;
  telegram_invite_link: string | null;
}

interface CustomerCommunitiesProps {
  communities: Community[];
}

export const CustomerCommunities = ({ communities }: CustomerCommunitiesProps) => {
  return (
    <div className="space-y-6 py-6">
      {communities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <Users className="h-8 w-8 mb-4" />
            <p>No communities found</p>
          </CardContent>
        </Card>
      ) : (
        communities.map((community) => (
          <Card key={community.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{community.name}</CardTitle>
                  <CardDescription>
                    Platform: <Badge variant="outline">{community.platform}</Badge>
                  </CardDescription>
                </div>
                {community.telegram_invite_link && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={community.telegram_invite_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Channel
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Total Members</p>
                        <p className="text-2xl font-bold">{community.member_count}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Total number of members in this community
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                      <Users className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Active Subscribers</p>
                        <p className="text-2xl font-bold">{community.subscription_count}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Number of members with active subscriptions
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Revenue</p>
                        <p className="text-2xl font-bold">
                          ${community.subscription_revenue}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Total subscription revenue from this community
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
