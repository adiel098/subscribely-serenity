
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function fetchCommunities() {
  try {
    // Fetch communities with their owner profiles and subscription data
    const { data: communities, error } = await supabase
      .from('communities')
      .select(`
        *,
        profiles:owner_id (
          full_name
        ),
        subscription_payments(amount)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to fetch communities");
      throw error;
    }

    console.log("Raw communities data:", communities);
    return communities;
  } catch (error) {
    console.error("Error in communities fetch service:", error);
    toast.error("An error occurred while fetching communities");
    return [];
  }
}
