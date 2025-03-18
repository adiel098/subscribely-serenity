
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastMessageParams {
  entityId: string;
  entityType: 'community' | 'group';
  message: string;
  filterType: 'all' | 'active' | 'expired' | 'plan';
  subscriptionPlanId?: string;
  includeButton?: boolean;
  image?: string | null;
}

interface BroadcastResult {
  success: boolean;
  broadcast_id?: string;
  sent_success?: number;
  sent_failed?: number;
  total_recipients?: number;
  error?: string;
}

export const useBroadcast = () => {
  const sendBroadcastMessage = async (params: BroadcastMessageParams): Promise<BroadcastResult> => {
    try {
      console.log('Sending broadcast message:', params);
      
      // Create a new broadcast record
      const { data: broadcastRecord, error: broadcastError } = await supabase
        .from('broadcast_messages')
        .insert({
          message: params.message,
          filter_type: params.filterType,
          subscription_plan_id: params.filterType === 'plan' ? params.subscriptionPlanId : null,
          community_id: params.entityType === 'community' ? params.entityId : null,
          group_id: params.entityType === 'group' ? params.entityId : null,
          status: 'pending',
          total_recipients: 0,
          sent_success: 0,
          sent_failed: 0,
          include_button: params.includeButton || false,
          image: params.image || null
        })
        .select()
        .single();
      
      if (broadcastError) {
        console.error('Error creating broadcast record:', broadcastError);
        throw new Error(`Failed to create broadcast: ${broadcastError.message}`);
      }
      
      if (!broadcastRecord) {
        throw new Error('Failed to create broadcast record: No data returned');
      }
      
      // Call the edge function to send the broadcast
      const response = await supabase.functions.invoke('send-broadcast', {
        body: {
          broadcast_id: broadcastRecord.id,
          entity_id: params.entityId,
          entity_type: params.entityType,
          filter_type: params.filterType,
          subscription_plan_id: params.subscriptionPlanId,
          include_button: params.includeButton || false,
          image: params.image || null
        }
      });
      
      if (response.error) {
        console.error('Error invoking send-broadcast function:', response.error);
        throw new Error(`Failed to send broadcast: ${response.error}`);
      }
      
      return {
        success: true,
        broadcast_id: broadcastRecord.id,
        ...response.data
      };
    } catch (error) {
      console.error('Error in sendBroadcastMessage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending broadcast'
      };
    }
  };
  
  const broadcastMutation = useMutation({
    mutationFn: sendBroadcastMessage,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Broadcast sent successfully to ${data.sent_success || 0} recipients`);
      } else {
        toast.error(`Failed to send broadcast: ${data.error}`);
      }
    },
    onError: (error) => {
      console.error('Broadcast mutation error:', error);
      toast.error(`Error sending broadcast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    sendBroadcastMessage: broadcastMutation.mutate,
    isLoading: broadcastMutation.isPending,
    error: broadcastMutation.error,
    data: broadcastMutation.data
  };
};
