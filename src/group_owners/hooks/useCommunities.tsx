
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

export interface Community {
  id: string;
  name: string;
  description?: string;
  telegram_chat_id?: string;
  telegram_photo_url?: string;
  custom_link?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  subscription_count?: number;
  is_group?: boolean;
  project_id?: string | null;
}

export const useCommunities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get regular communities
      const { data: communities, error } = await supabase
        .from("communities")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching communities:", error);
        throw error;
      }

      // Get projects that might have communities associated
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      // Process the communities, marking those that are groups
      const processedCommunities = communities?.map(community => ({
        ...community,
        is_group: !!community.project_id // If it has a project_id, it's likely a group
      })) || [];

      return processedCommunities;
    },
    enabled: !!user?.id,
  });
};
