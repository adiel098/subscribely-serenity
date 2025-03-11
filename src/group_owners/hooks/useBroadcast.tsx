
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BroadcastParams {
  entityId: string;
  entityType: 'community' | 'group';
  message: string;
  filterType: 'all' | 'active' | 'expired' | 'plan';
  subscriptionPlanId?: string;
}

interface BroadcastResult {
  success: boolean;
  sent_success?: number;
  sent_failed?: number;
  total_recipients?: number;
  error?: string;
}

export const useBroadcast = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendBroadcastMessage = async (params: BroadcastParams): Promise<BroadcastResult> => {
    setIsLoading(true);
    try {
      console.log("Broadcasting message with params:", params);
      
      // Determine the ID field name based on entity type
      const idField = params.entityType === 'community' ? 'community_id' : 'group_id';
      
      // Insert the broadcast record to track it
      const { data: broadcastRecord, error: insertError } = await supabase
        .from('broadcast_messages')
        .insert({
          [idField]: params.entityId,
          message: params.message,
          filter_type: params.filterType,
          subscription_plan_id: params.filterType === 'plan' ? params.subscriptionPlanId : null,
          status: 'sending',
          total_recipients: 0,
          sent_success: 0,
          sent_failed: 0
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating broadcast record:", insertError);
        return {
          success: false,
          error: "Failed to create broadcast record"
        };
      }
      
      // Call the edge function to handle the actual sending
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          action: 'broadcast',
          community_id: params.entityType === 'community' ? params.entityId : null,
          group_id: params.entityType === 'group' ? params.entityId : null,
          message: params.message,
          filter_type: params.filterType,
          subscription_plan_id: params.filterType === 'plan' ? params.subscriptionPlanId : null,
          broadcast_id: broadcastRecord.id
        }
      });
      
      if (error) {
        console.error("Error sending broadcast:", error);
        
        // Update the broadcast record with the error status
        await supabase
          .from('broadcast_messages')
          .update({
            status: 'failed',
            filter_data: { error: error.message }
          })
          .eq('id', broadcastRecord.id);
          
        return {
          success: false,
          error: error.message
        };
      }
      
      // Update the broadcast record with the result
      if (data?.status) {
        await supabase
          .from('broadcast_messages')
          .update({
            status: 'completed',
            total_recipients: data.totalRecipients || 0,
            sent_success: data.successCount || 0,
            sent_failed: data.failureCount || 0,
            sent_at: new Date().toISOString()
          })
          .eq('id', broadcastRecord.id);
      }
      
      return {
        success: true,
        sent_success: data?.successCount || 0,
        sent_failed: data?.failureCount || 0,
        total_recipients: data?.totalRecipients || 0
      };
    } catch (error) {
      console.error("Error in sendBroadcastMessage:", error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendBroadcastMessage,
    isLoading
  };
};
