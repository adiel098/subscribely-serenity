
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { toast } from "sonner";

export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  telegram_chat_id?: string | null;
  telegram_photo_url?: string | null;
  custom_link?: string | null;
  created_at?: string;
  updated_at?: string;
  is_group?: boolean;
}

export const useCommunityGroups = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user found, returning empty array");
        return [];
      }
      
      console.log("Fetching projects for user:", user.id);
      
      try {
        // Query projects table
        const { data: projects, error } = await supabase
          .from("projects")
          .select(`
            id, name, description, owner_id, 
            created_at, updated_at, bot_token
          `)
          .eq("owner_id", user.id);

        if (error) {
          console.error("Error fetching projects:", error);
          toast.error("Failed to fetch projects");
          throw error;
        }

        // Transform the data to match the expected format with all required properties
        const formattedGroups = projects.map(project => {
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            owner_id: project.owner_id,
            created_at: project.created_at,
            updated_at: project.updated_at,
            is_group: true // Add this virtual property for compatibility
          };
        });

        console.log("Successfully fetched projects:", formattedGroups);
        return formattedGroups as CommunityGroup[];
      } catch (error) {
        console.error("Error in projects query:", error);
        toast.error("An error occurred while fetching projects");
        return [];
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  return query;
};
