
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/auth/contexts/AuthContext";

interface UpdateCommunityParams {
  id: string;
  name: string;
  description: string | null;
  custom_link: string | null;
}

export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (params: UpdateCommunityParams) => {
      if (!user) throw new Error("User not authenticated");
      
      // First check if this community belongs to the user
      const { data: communityCheck, error: checkError } = await supabase
        .from("communities")
        .select("id")
        .eq("id", params.id)
        .eq("owner_id", user.id)
        .single();
      
      if (checkError || !communityCheck) {
        throw new Error("You don't have permission to update this community");
      }
      
      // If custom_link is provided, check if it's already in use by another community
      if (params.custom_link) {
        const { data: linkCheck, error: linkCheckError } = await supabase
          .from("communities")
          .select("id")
          .eq("custom_link", params.custom_link)
          .neq("id", params.id)
          .limit(1);
        
        if (linkCheckError) {
          throw new Error(`Error checking custom link: ${linkCheckError.message}`);
        }
        
        if (linkCheck && linkCheck.length > 0) {
          throw new Error("This custom link is already in use by another community");
        }
      }
      
      // Update the community
      const { data, error } = await supabase
        .from("communities")
        .update({
          name: params.name,
          description: params.description,
          custom_link: params.custom_link,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id)
        .eq("owner_id", user.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating community: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["community", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};
