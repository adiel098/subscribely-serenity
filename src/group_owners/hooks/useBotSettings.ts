
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BotSettings } from './types/subscription.types';

export const useBotSettings = (projectId?: string) => {
  const queryClient = useQueryClient();
  
  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['bot-settings', projectId],
    queryFn: async (): Promise<BotSettings | null> => {
      if (!projectId) return null;
      
      try {
        const { data, error } = await supabase
          .from('telegram_bot_settings')
          .select('*')
          .eq('project_id', projectId)
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
    enabled: !!projectId
  });
  
  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: Partial<BotSettings>) => {
      if (!projectId) throw new Error("No project ID provided");
      
      try {
        // Check if settings exist first
        const { data: existingSettings, error: existingError } = await supabase
          .from('telegram_bot_settings')
          .select('id')
          .eq('project_id', projectId)
          .maybeSingle();
        
        if (existingError) throw existingError;
        
        if (!existingSettings) {
          // Create new settings
          const { data, error } = await supabase
            .from('telegram_bot_settings')
            .insert({
              project_id: projectId,
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
            .eq('project_id', projectId)
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
      queryClient.invalidateQueries({ queryKey: ['bot-settings', projectId] });
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
