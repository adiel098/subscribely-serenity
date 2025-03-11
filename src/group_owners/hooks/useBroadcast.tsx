
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastMessageParams {
  entityId: string;
  entityType: 'community' | 'group';
  message: string;
  filterType: 'all' | 'active' | 'expired' | 'plan';
  subscriptionPlanId?: string;
}

export const useBroadcast = () => {
  const sendBroadcastMessage = async (params: BroadcastMessageParams) => {
    try {
      console.log('Sending broadcast message:', params);
      
      // Create a new broadcast record
      const { data: broadcastRecord, error: broadcastError } = await supabase
        .from('broadcast_messages')
        .insert({
          message: params.message,
          filter_type: params.filterType,
          subscription_plan_id: params.filterType === 'plan' ? params.subscriptionPlanId : null,
          ...(params.entityType === 'community' 
            ? { community_id: params.entityId } 
            : { group_id: params.entityId }),
          status: 'pending',
          total_recipients: 0,
          sent_success: 0,
          sent_failed: 0
        })
        .select()
        .single();
      
      if (broadcastError) {
        console.error('Error creating broadcast record:', broadcastError);
        throw new Error(`Failed to create broadcast: ${broadcastError.message}`);
      }
      
      // Call the edge function to send the broadcast
      const response = await supabase.functions.invoke('send-broadcast', {
        body: {
          broadcast_id: broadcastRecord.id,
          entity_id: params.entityId,
          entity_type: params.entityType,
          filter_type: params.filterType,
          subscription_plan_id: params.subscriptionPlanId
        }
      });
      
      if (response.error) {
        console.error('Error invoking send-broadcast function:', response.error);
        throw new Error(`Failed to send broadcast: ${response.error.message}`);
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
  
  return {
    sendBroadcastMessage
  };
};
