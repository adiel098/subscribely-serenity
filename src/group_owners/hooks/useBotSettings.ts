import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

export interface ReminderMessage {
  days_before: number;
  message: string;
  image: string | null;
}

export interface BotSettings {
  id: string;
  project_id: string; 
  welcome_message: string;
  welcome_image: string | null;
  subscription_reminder_days: number;
  subscription_reminder_message: string;
  expired_subscription_message: string;
  renewal_discount_enabled: boolean;
  renewal_discount_percentage: number;
  language: string;
  first_reminder_days: number;
  first_reminder_message: string;
  first_reminder_image: string | null;
  second_reminder_days: number;
  second_reminder_message: string;
  second_reminder_image: string | null;
  created_at: string;
  updated_at: string;
  use_custom_bot?: boolean;
  custom_bot_token?: string | null;
  bot_signature?: string;
  auto_welcome_message?: boolean;
  auto_remove_expired?: boolean;
}

export const useBotSettings = (entityId: string | null) => {
  const queryClient = useQueryClient();
  
  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['bot-settings', entityId],
    queryFn: async (): Promise<BotSettings | null> => {
      if (!entityId) return null;
      
      try {
        const { data, error } = await supabase
          .from('telegram_bot_settings')
          .select('*')
          .eq('project_id', entityId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            console.log("No bot settings found, returning null");
            return null;
          }
          throw error;
        }
        
        return data as BotSettings;
      } catch (error) {
        console.error("Error fetching bot settings:", error);
        throw error;
      }
    },
    enabled: !!entityId
  });
  
  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: Partial<BotSettings>) => {
      if (!entityId) throw new Error("No project ID provided");
      
      try {
        // Check if settings exist first
        const { data: existingSettings, error: existingError } = await supabase
          .from('telegram_bot_settings')
          .select('id')
          .eq('project_id', entityId)
          .maybeSingle();
        
        if (existingError) throw existingError;
        
        if (!existingSettings) {
          // Create new settings
          const { data, error } = await supabase
            .from('telegram_bot_settings')
            .insert({
              project_id: entityId,
              ...updatedSettings
            })
            .select()
            .single();
            
          if (error) throw error;
          return data;
        } else {
          // Update existing settings
          const { data, error } = await supabase
            .from('telegram_bot_settings')
            .update(updatedSettings)
            .eq('project_id', entityId)
            .select()
            .single();
            
          if (error) throw error;
          return data;
        }
      } catch (error) {
        console.error("Error updating bot settings:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-settings', entityId] });
      toast.success("Bot settings updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating bot settings:", error);
      toast.error(`Failed to update bot settings: ${error.message}`);
    }
  });
  
  return {
    settings,
    isLoading,
    error,
    updateSettings
  };
};
