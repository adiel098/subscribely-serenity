import { supabase } from "@/integrations/supabase/client";
import { Community } from "../types/community.types";
import { SubscriptionPlan } from "../types/subscriptionTypes";
import logger from "@/utils/logger";

export const fetchCommunities = async (): Promise<Community[]> => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*, subscription_plans(*)');

    if (error) throw error;

    // Process the data to match the Community type
    const communities: Community[] = data.map(item => {
      return {
        id: item.id,
        name: item.name,
        description: item.description || "",
        telegram_photo_url: item.telegram_photo_url,
        telegram_chat_id: item.telegram_chat_id,
        custom_link: item.custom_link,
        is_group: item.is_group,
        platform_url: `${process.env.NEXT_PUBLIC_APP_URL}/communities/${item.id}`,
        miniapp_url: `https://t.me/YourBot?start=${item.id}`,
        subscription_plans: item.subscription_plans.map((plan: any): SubscriptionPlan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || "",
          price: plan.price,
          interval: plan.interval,
          features: plan.features || [],
          is_active: plan.is_active,
          community_id: plan.community_id,
          project_id: plan.project_id,
          has_trial_period: plan.has_trial_period || false,
          trial_days: plan.trial_days || 0,
          created_at: plan.created_at,
          updated_at: plan.updated_at
        }))
      };
    });

    return communities;
  } catch (error) {
    logger.error('Error fetching communities:', error);
    throw error;
  }
};

export const fetchCommunityByIdOrLink = async (idOrLink: string): Promise<Community> => {
  try {
    // First try to find by ID
    let { data, error } = await supabase
      .from('communities')
      .select('*, subscription_plans(*)')
      .eq('id', idOrLink)
      .single();
    
    // If not found by ID, try to find by custom link
    if (error || !data) {
      const { data: linkData, error: linkError } = await supabase
        .from('communities')
        .select('*, subscription_plans(*)')
        .eq('custom_link', idOrLink)
        .single();
      
      if (linkError) throw linkError;
      data = linkData;
    }
    
    if (!data) throw new Error('Community not found');
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || "",
      telegram_photo_url: data.telegram_photo_url,
      telegram_chat_id: data.telegram_chat_id,
      custom_link: data.custom_link,
      is_group: data.is_group,
      platform_url: `${process.env.NEXT_PUBLIC_APP_URL}/communities/${data.id}`,
      miniapp_url: `https://t.me/YourBot?start=${data.id}`,
      subscription_plans: data.subscription_plans.map((plan: any): SubscriptionPlan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        interval: plan.interval,
        features: plan.features || [],
        is_active: plan.is_active,
        community_id: plan.community_id,
        project_id: plan.project_id,
        has_trial_period: plan.has_trial_period || false,
        trial_days: plan.trial_days || 0,
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }))
    };
  } catch (error) {
    logger.error('Error fetching community:', error);
    throw error;
  }
};

export const searchCommunities = async (query: string): Promise<Community[]> => {
  try {
    if (!query || query.trim().length === 0) {
      return await fetchCommunities();
    }
    
    const { data, error } = await supabase
      .from('communities')
      .select('*, subscription_plans(*)')
      .ilike('name', `%${query}%`);
      
    if (error) throw error;
    
    const communities: Community[] = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      telegram_photo_url: item.telegram_photo_url,
      telegram_chat_id: item.telegram_chat_id,
      custom_link: item.custom_link,
      is_group: item.is_group,
      platform_url: `${process.env.NEXT_PUBLIC_APP_URL}/communities/${item.id}`,
      miniapp_url: `https://t.me/YourBot?start=${item.id}`,
      subscription_plans: item.subscription_plans.map((plan: any): SubscriptionPlan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        interval: plan.interval,
        features: plan.features || [],
        is_active: plan.is_active,
        community_id: plan.community_id,
        project_id: plan.project_id,
        has_trial_period: plan.has_trial_period || false,
        trial_days: plan.trial_days || 0,
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }))
    }));
    
    return communities;
  } catch (error) {
    logger.error('Error searching communities:', error);
    throw error;
  }
};
