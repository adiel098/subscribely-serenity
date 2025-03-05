
import { useQuery } from "@tanstack/react-query";
import { fetchCommunities } from "@/admin/services/communityService";
import { processCommunityData } from "@/admin/utils/communityUtils";

export interface AdminCommunity {
  id: string;
  name: string;
  owner_id: string;
  owner_name?: string;
  members: number;
  subscriptions: number;
  revenue: number;
  status: string;
  photoUrl: string | null;
}

export const useAdminCommunities = () => {
  return useQuery({
    queryKey: ["admin-communities"],
    queryFn: async (): Promise<AdminCommunity[]> => {
      const communitiesData = await fetchCommunities();
      const processedCommunities = processCommunityData(communitiesData);
      console.log("Processed communities:", processedCommunities);
      return processedCommunities;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
};
