import { supabase } from "@/integrations/supabase/client";
import { Community } from "../types/community.types";
import { SubscriptionPlan } from "../types/subscriptionTypes";
import logger from "@/utils/logger";

export const fetchCommunities = async (): Promise<Community[]> => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*, project_plans(*)');

    if (error) throw error;

    // Process the data into our Community type
    const communities = data.map((item: any): Community => ({
      id: item.id,
      name: item.name,
      telegram_group_id: item.telegram_group_id,
      telegram_photo_url: item.telegram_photo_url,
      description: item.description || '',
      is_public: item.is_public,
      is_group: item.is_group,
      platform_url: `${process.env.NEXT_PUBLIC_APP_URL}/communities/${item.id}`,
      miniapp_url: `https://t.me/YourBot?start=${item.id}`,
      project_plans: item.project_plans.map((plan: any): SubscriptionPlan => ({
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
    logger.error('Error fetching communities:', error);
    throw error;
  }
};

export const fetchCommunityByIdOrLink = async (idOrLink: string): Promise<Community> => {
  try {
    // First try to find by ID
    let { data, error } = await supabase
      .from('communities')
      .select('*, project_plans(*)')
      .eq('id', idOrLink)
      .single();
    
    // If not found by ID, try to find by custom link
    if (error || !data) {
      const { data: linkData, error: linkError } = await supabase
        .from('communities')
        .select('*, project_plans(*)')
        .eq('custom_link', idOrLink)
        .single();
      
      if (linkError) throw linkError;
      data = linkData;
    }
    
    if (!data) throw new Error('Community not found');
    
    return {
      id: data.id,
      name: data.name,
      telegram_group_id: data.telegram_group_id,
      telegram_photo_url: data.telegram_photo_url,
      description: data.description || '',
      is_public: data.is_public,
      is_group: data.is_group,
      platform_url: `${process.env.NEXT_PUBLIC_APP_URL}/communities/${data.id}`,
      miniapp_url: `https://t.me/YourBot?start=${data.id}`,
      project_plans: data.project_plans.map((plan: any): SubscriptionPlan => ({
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
      .select('*, project_plans(*)')
      .ilike('name', `%${query}%`);
      
    if (error) throw error;
    
    const communities = data.map((item: any): Community => ({
      id: item.id,
      name: item.name,
      telegram_group_id: item.telegram_group_id,
      telegram_photo_url: item.telegram_photo_url,
      description: item.description || '',
      is_public: item.is_public,
      is_group: item.is_group,
      platform_url: `${process.env.NEXT_PUBLIC_APP_URL}/communities/${item.id}`,
      miniapp_url: `https://t.me/YourBot?start=${item.id}`,
      project_plans: item.project_plans.map((plan: any): SubscriptionPlan => ({
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
