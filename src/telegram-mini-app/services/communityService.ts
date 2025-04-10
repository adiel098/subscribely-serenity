import { supabase } from "@/integrations/supabase/client";
import { Community } from "../types/community.types";
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("communityService");

// We need to update the mock data to include required SubscriptionPlan fields
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
