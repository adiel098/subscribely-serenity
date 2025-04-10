import { supabase } from '@/lib/supabaseClient';
import { Community } from '../utils/types/community.types';
import { TEST_COMMUNITY } from '../utils/development/testData';

export const fetchCommunityByIdOrLink = async (idOrLink: string): Promise<Community | null> => {
  try {
    // For development testing
    if (process.env.NODE_ENV === 'development' && (!idOrLink || idOrLink === 'test')) {
      return TEST_COMMUNITY;
    }
    
    // Check if it's a project ID format
    if (idOrLink.startsWith('project_')) {
      const projectId = idOrLink.replace('project_', '');
      
      // Fetch project and its associated communities
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          communities (
            id, 
            name, 
            description, 
            telegram_photo_url,
            telegram_chat_id,
            custom_link,
            is_group,
            subscription_plans (
              id, 
              name, 
              description,
              price,
              interval,
              features,
              is_active,
              community_id,
              created_at,
              updated_at
            )
          )
        `)
        .eq('id', projectId)
        .single();
        
      if (error || !data || !data.communities || data.communities.length === 0) {
        console.error('Error fetching project communities:', error);
        return null;
      }
      
      // Return the first community
      const community = data.communities[0];
      return {
        ...community,
        platform_url: `https://app.example.com/communities/${community.id}`,
        miniapp_url: `https://t.me/YourBot?start=${community.id}`
      };
    }
    
    // Regular community lookup
    const { data, error } = await supabase
      .from('communities')
      .select(`
        id, 
        name, 
        description, 
        telegram_photo_url,
        telegram_chat_id,
        custom_link,
        is_group,
        subscription_plans (
          id, 
          name, 
          description,
          price,
          interval,
          features,
          is_active,
          community_id,
          created_at,
          updated_at
        )
      `)
      .or(`id.eq.${idOrLink},custom_link.eq.${idOrLink}`)
      .single();
      
    if (error) {
      console.error('Error fetching community:', error);
      return null;
    }
    
    return {
      ...data,
      platform_url: `https://app.example.com/communities/${data.id}`,
      miniapp_url: `https://t.me/YourBot?start=${data.id}`
    };
  } catch (error) {
    console.error('Error in fetchCommunityByIdOrLink:', error);
    return null;
  }
};

// Placeholder for a full searchCommunities implementation
export const searchCommunities = async (query: string): Promise<Community[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('communities')
      .select(`
        id, 
        name, 
        description, 
        telegram_photo_url,
        telegram_chat_id,
        custom_link,
        is_group,
        subscription_plans (
          id, 
          name, 
          description,
          price,
          interval,
          features,
          is_active,
          community_id,
          created_at,
          updated_at
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
      
    if (error) {
      console.error('Error searching communities:', error);
      return [];
    }
    
    return data.map(community => ({
      ...community,
      platform_url: `https://app.example.com/communities/${community.id}`,
      miniapp_url: `https://t.me/YourBot?start=${community.id}`
    }));
  } catch (error) {
    console.error('Error in searchCommunities:', error);
    return [];
  }
};

export async function fetchCommunities(): Promise<Community[]> {
  try {
    // First check if Telegram Mini App Data is available
    const telegramData = window.Telegram?.WebApp?.initDataUnsafe;
    
    if (telegramData?.user) {
      logger.log("Fetching communities with Telegram user data", telegramData.user);
      
      // Get user info from Telegram
      const telegramUser = telegramData.user;
      
      // Check if user exists in our database
      const { data: existingUser, error: userCheckError } = await supabase
        .from('telegram_mini_app_users')
        .select('id')
        .eq('telegram_id', telegramUser.id.toString())
        .single();
      
      if (userCheckError && userCheckError.code !== 'PGRST116') { // Not found error
        throw userCheckError;
      }
      
      // If user doesn't exist, add them to our database
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('telegram_mini_app_users')
          .insert({
            telegram_id: telegramUser.id.toString(),
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            photo_url: telegramUser.photo_url
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      // Now, fetch the communities
      const { data: communities, error: communitiesError } = await supabase
        .rpc('get_communities_with_plans', {
          telegram_user_id_param: telegramUser.id.toString()
        });
      
      if (communitiesError) {
        throw communitiesError;
      }
      
      if (!communities || communities.length === 0) {
        logger.warn("No communities found for user:", telegramUser.id);
        return [];
      }

      // Process and return the communities
      return communities.map(community => {
        // Make sure each subscription plan has the required fields
        const plans = community.subscription_plans?.map(plan => ({
          ...plan,
          project_id: plan.project_id || community.id,
          has_trial_period: plan.has_trial_period || false,
          trial_days: plan.trial_days || 0,
          created_at: plan.created_at || new Date().toISOString(),
          updated_at: plan.updated_at || new Date().toISOString()
        })) || [];
        
        return {
          ...community,
          subscription_plans: plans
        };
      });
    } else {
      logger.warn("No Telegram user data found, fetching communities anonymously");
      
      // For anonymous access or testing environment
      // Get first several communities for display
      const { data: communities, error } = await supabase
        .from('communities')
        .select(`
          *,
          subscription_plans:project_plans(*)
        `)
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      if (!communities || communities.length === 0) {
        logger.warn("No communities found");
        return [];
      }
      
      return communities.map(community => {
        // Ensure plans have required fields
        const plans = community.subscription_plans?.map((plan: any) => ({
          ...plan,
          project_id: plan.project_id || community.id,
          has_trial_period: plan.has_trial_period || false,
          trial_days: plan.trial_days || 0,
          created_at: plan.created_at || new Date().toISOString(),
          updated_at: plan.updated_at || new Date().toISOString()
        })) || [];
        
        return {
          ...community,
          platform_url: `https://app.membify.io/community/${community.id}`,
          miniapp_url: `https://t.me/membify_bot/app?startapp=${community.id}`,
          subscription_plans: plans
        };
      });
    }
  } catch (error) {
    logger.error("Error fetching communities:", error);
    throw error;
  }
}
