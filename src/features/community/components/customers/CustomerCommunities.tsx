
import { Users, UserPlus, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { Badge } from "@/features/community/components/ui/badge";
import { Button } from "@/features/community/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/community/components/ui/tooltip";

interface CustomerCommunitiesProps {
  data?: Database["public"]["Tables"]["customers"]["Row"];
}

export const CustomerCommunities = ({ data }: CustomerCommunitiesProps) => {
  if (!data?.communities?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No communities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.communities.map((community: any) => (
        <Card key={community.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </div>
              <Badge>{community.role}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Users className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Members</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Invite Members</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Community Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
