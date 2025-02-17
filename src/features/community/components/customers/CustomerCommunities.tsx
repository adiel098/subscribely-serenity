
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { Badge } from "@/features/community/components/ui/badge";
import { ScrollArea } from "@/features/community/components/ui/scroll-area";

interface Community {
  id: string;
  name: string;
  created_at: string;
  subscription_status: boolean;
}

interface CustomerCommunitiesProps {
  customerId: string;
}

export const CustomerCommunities = ({ customerId }: CustomerCommunitiesProps) => {
  const { data: communities } = useQuery({
    queryKey: ['customerCommunities', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          community:communities (
            id,
            name,
            created_at
          ),
          subscription_status
        `)
        .eq('user_id', customerId);

      if (error) throw error;
      return data?.map(item => ({
        ...item.community,
        subscription_status: item.subscription_status
      })) || [];
    }
  });

  if (!communities?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No communities joined</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {communities.map((community) => (
              <div key={community.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{community.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(community.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={community.subscription_status ? "success" : "destructive"}>
                  {community.subscription_status ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
