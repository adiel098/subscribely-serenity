
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Subscriber } from "./useSubscribers";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriberManagement = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  /**
   * Remove a subscriber from a group
   */
  const removeSubscriber = async (
    subscriber: Subscriber,
    botToken: string
  ) => {
    if (!subscriber || !botToken) return;

    setIsRemoving(true);
    
    try {
      console.log(`Initiating removal for user: ${subscriber.telegram_username || subscriber.telegram_user_id}`);
      
      // Call the kick-member edge function - this will set the status to 'removed'
      const { data, error } = await supabase.functions.invoke("kick-member", {
        body: {
          member_id: subscriber.id,
          telegram_user_id: subscriber.telegram_user_id,
          chat_id: subscriber.community.telegram_chat_id,
          bot_token: botToken,
        },
      });

      if (error) {
        console.error("Error removing subscriber:", error);
        toast({
          title: "Error",
          description: "Failed to remove subscriber. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Handle the response from the edge function
      if (data.success) {
        console.log("Subscriber removed successfully", data);
        
        // Show appropriate success message
        if (!data.telegram_success) {
          toast({
            title: "Partial Success",
            description: `User marked as removed in database, but could not be removed from Telegram group: ${data.telegram_error}`,
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: "Subscriber removed successfully",
          });
        }
        
        return true;
      } else {
        console.error("Failed to remove subscriber:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to remove subscriber",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    removeSubscriber,
    isRemoving,
  };
};
