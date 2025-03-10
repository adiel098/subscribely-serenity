
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface Subscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  joined_at: string;
  last_active: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_status: string;
  is_active: boolean | null;
  total_messages: number | null;
  community_id: string;
  plan: {
    id: string;
    name: string;
    interval: string;
    price: number;
  } | null;
}

export const useSubscribers = (communityId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscribers', communityId],
    queryFn: async () => {
      if (!communityId) return [];

      // First, fetch telegram chat members
      const { data: membersData, error: membersError } = await supabase
        .from('telegram_chat_members')
        .select(`
          *,
          telegram_bot_settings!inner(community_id),
          plan:subscription_plans(
            id,
            name,
            interval,
            price
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching subscribers:', membersError);
        throw membersError;
      }

      // Extract all telegram user IDs to fetch user profiles
      const telegramUserIds = membersData.map(member => member.telegram_user_id);
      
      // Fetch user profiles for these telegram IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('telegram_mini_app_users')
        .select('telegram_id, first_name, last_name')
        .in('telegram_id', telegramUserIds);
        
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        // Continue even if profiles fetch fails
        // We'll just use null values for first_name and last_name
      }
      
      // Create a lookup map for quick access
      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.telegram_id, {
          first_name: profile.first_name,
          last_name: profile.last_name
        });
      });
      
      // Merge the data
      const subscribersWithProfiles = membersData.map(member => {
        const profile = profileMap.get(member.telegram_user_id);
        
        return {
          ...member,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null
        };
      });

      console.log('Fetched subscribers with profiles:', subscribersWithProfiles);
      
      return subscribersWithProfiles as Subscriber[];
    },
    enabled: Boolean(communityId),
  });

  useEffect(() => {
    if (communityId) {
      const checkStatus = async () => {
        try {
          const { error } = await supabase.functions.invoke('telegram-webhook', {
            body: { 
              communityId,
              path: '/update-activity'
            }
          });

          if (error) throw error;
          
          await refetch();
        } catch (error) {
          console.error('Error checking member status:', error);
        }
      };

      checkStatus();
    }
  }, [communityId]);

  return { data, isLoading, error, refetch };
};
