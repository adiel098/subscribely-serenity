
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTriggerSubscriptionCheck = (communityId: string | null) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const triggerManualCheck = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Triggering subscription check...",
        description: communityId 
          ? `Checking subscriptions for this community.` 
          : "Checking all subscriptions.",
        variant: "default"
      });
      
      const payload = communityId ? { community_id: communityId } : {};
      
      const { error } = await supabase.functions.invoke("check-subscriptions", {
        body: payload
      });

      if (error) {
        toast({
          title: "Error running subscription check",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Subscription check triggered",
        description: communityId 
          ? "The check has been manually triggered for this community." 
          : "The check has been manually triggered for all communities.",
        variant: "default"
      });

      return true;
    } catch (err) {
      console.error("Failed to trigger check:", err);
      toast({
        title: "Error",
        description: "Failed to trigger subscription check",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    triggerManualCheck,
    isLoading
  };
};
