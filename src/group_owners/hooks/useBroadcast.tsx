
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export const useBroadcast = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const broadcastMutation = useMutation({
    mutationFn: sendBroadcastMessage,
    onSuccess: (data) => {
      toast({
        title: "Message sent",
        description: `Broadcast sent to ${data.sent_count} of ${data.total_count} members`,
      });
      return data;
    },
    onError: (error: any) => {
      console.error("Error in sendBroadcastMessage:", error);
      toast({
        variant: "destructive",
        title: "Error sending broadcast",
        description: error.message || "An unexpected error occurred",
      });
      throw error;
    },
  });

  const sendBroadcast = async (
    entityId: string,
    entityType: "community" | "group",
    message: string,
    filterType: "all" | "active" | "expired" | "plan" = "all",
    includeButton: boolean = false,
    buttonText?: string,
    buttonUrl?: string,
    image?: string | null
  ) => {
    setIsLoading(true);
    try {
      return await broadcastMutation.mutateAsync({
        entityId,
        entityType,
        message,
        filterType,
        includeButton,
        buttonText,
        buttonUrl,
        image,
      });
    } catch (error: any) {
      sonnerToast.error(`Failed to send broadcast: ${error.message || 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendBroadcast,
    isLoading: isLoading || broadcastMutation.isPending,
    error: broadcastMutation.error,
  };
};

async function sendBroadcastMessage(params: {
  entityId: string;
  entityType: "community" | "group";
  message: string;
  filterType?: "all" | "active" | "expired" | "plan";
  includeButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  image?: string | null;
}) {
  console.log('Sending broadcast message with params:', {
    ...params,
    image: params.image ? 'Image data present (truncated)' : null
  });
  
  try {
    const { data, error } = await supabase.functions.invoke("send-broadcast", {
      body: params
    });

    if (error) {
      console.error("Error invoking send-broadcast function:", error);
      throw new Error(`Failed to send broadcast: ${error.message}`);
    }

    if (!data.success) {
      console.error("Broadcast failed:", data);
      throw new Error(`Failed to send broadcast: ${data.message}`);
    }

    return data;
  } catch (err: any) {
    console.error("Error in sendBroadcastMessage:", err);
    throw new Error(`Failed to send broadcast: ${err.message}`);
  }
}
