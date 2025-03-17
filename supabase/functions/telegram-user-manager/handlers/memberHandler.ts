
import { logSubscriptionActivity } from "../utils/logger.ts";

/**
 * Handles creating or updating a community member
 */
export async function handleCreateOrUpdateMember(supabase, memberData) {
  console.log(`[telegram-user-manager] Creating or updating member with data:`, JSON.stringify(memberData, null, 2));
  
  const { 
    telegram_id, 
    community_id, 
    subscription_plan_id, 
    status, 
    is_active,
    payment_id, 
    username,
    subscription_start_date,
    subscription_end_date
  } = memberData;
  
  // First check if user is suspended
  try {
    console.log(`[telegram-user-manager] Checking if user ${telegram_id} is suspended`);
    
    // Look up the user in telegram_mini_app_users first
    const { data: telegramUser, error: telegramUserError } = await supabase
      .from('telegram_mini_app_users')
      .select('telegram_id, is_suspended')
      .eq('telegram_id', telegram_id)
      .maybeSingle();
      
    if (telegramUserError) {
      console.error(`[telegram-user-manager] Error checking telegram_mini_app_users:`, telegramUserError);
      // Continue despite error, assume user is not suspended
      console.log(`[telegram-user-manager] Proceeding with assumption that user is not suspended`);
    } else if (telegramUser?.is_suspended) {
      console.log(`[telegram-user-manager] Suspended user ${telegram_id} attempted to join/update membership`);
      return { success: false, error: "User is suspended" };
    } else {
      console.log(`[telegram-user-manager] User ${telegram_id} is not suspended or not found in telegram_mini_app_users`);
    }

    // Use provided dates if available, otherwise calculate them
    let startDate = subscription_start_date ? new Date(subscription_start_date) : new Date();
    let endDate = subscription_end_date ? new Date(subscription_end_date) : null;
    
    // If we don't have an end date, calculate it based on plan
    if (!endDate && subscription_plan_id) {
      console.log(`[telegram-user-manager] Getting plan details for ID: ${subscription_plan_id}`);
      const { data: planData, error: planError } = await supabase
        .from("subscription_plans")
        .select("interval, price")
        .eq("id", subscription_plan_id)
        .single();

      if (planError) {
        console.error(`[telegram-user-manager] Error fetching plan details:`, planError);
        return { success: false, error: planError.message };
      }

      console.log(`[telegram-user-manager] Retrieved plan details:`, JSON.stringify(planData, null, 2));

      // Calculate subscription end date based on plan interval
      endDate = calculateEndDate(startDate, planData.interval);
    }

    console.log(`[telegram-user-manager] Using subscription: startDate=${startDate.toISOString()}, endDate=${endDate?.toISOString() || 'Not set'}`);

    // Check if member already exists
    console.log(`[telegram-user-manager] Checking if member exists: telegramId=${telegram_id}, communityId=${community_id}`);
    const { data: existingMember, error: memberError } = await supabase
      .from("telegram_chat_members")
      .select("id, subscription_status")
      .eq("telegram_user_id", telegram_id)
      .eq("community_id", community_id)
      .maybeSingle();

    if (memberError) {
      console.error(`[telegram-user-manager] Error checking existing member:`, memberError);
      return { success: false, error: memberError.message };
    }

    // Determine is_active based on the provided status
    // It should be true for 'active' and false for other statuses
    const isActiveMember = is_active !== undefined ? is_active : (status === 'active');
    
    // Standardize subscription_status value
    let subscriptionStatus = status || 'active';
    
    // Validate that status is one of the allowed values
    if (!['active', 'inactive', 'expired', 'removed'].includes(subscriptionStatus)) {
      console.warn(`[telegram-user-manager] Invalid status value "${subscriptionStatus}", defaulting to "active"`);
      subscriptionStatus = 'active';
    }

    let result;
    
    if (existingMember) {
      result = await updateExistingMember(supabase, existingMember.id, {
        subscription_plan_id,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate ? endDate.toISOString() : null,
        subscription_status: subscriptionStatus,
        is_active: isActiveMember,
        telegram_username: username
      });
    } else {
      result = await createNewMember(supabase, {
        telegram_user_id: telegram_id,
        community_id,
        subscription_plan_id,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate ? endDate.toISOString() : null,
        subscription_status: subscriptionStatus,
        is_active: isActiveMember,
        telegram_username: username
      });
    }

    if (result.success) {
      // Log subscription activity
      await logSubscriptionActivity(
        supabase,
        telegram_id,
        community_id,
        existingMember ? 'subscription_renewed' : 'subscription_created',
        `Status: ${subscriptionStatus}, Is Active: ${isActiveMember}, Plan: ${subscription_plan_id}, Payment: ${payment_id || 'N/A'}`
      );
    }

    return result;
  } catch (err) {
    console.error(`[telegram-user-manager] Unexpected error in handleCreateOrUpdateMember:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Calculate subscription end date based on plan interval
 */
function calculateEndDate(startDate, interval) {
  const endDate = new Date(startDate);
  
  // Add duration based on interval
  if (interval === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (interval === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else if (interval === "half-yearly") {
    // Add 6 months for half-yearly subscriptions
    endDate.setMonth(endDate.getMonth() + 6);
    console.log(`[telegram-user-manager] Calculated half-yearly subscription end date: ${endDate.toISOString()}`);
  } else if (interval === "quarterly") {
    // Add 3 months for quarterly subscriptions
    endDate.setMonth(endDate.getMonth() + 3);
    console.log(`[telegram-user-manager] Calculated quarterly subscription end date: ${endDate.toISOString()}`);
  } else if (interval === "weekly") {
    endDate.setDate(endDate.getDate() + 7);
  } else if (interval === "daily") {
    endDate.setDate(endDate.getDate() + 1);
  } else if (interval === "one_time") {
    // For one-time payments, set a default 1-year validity
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  return endDate;
}

/**
 * Update an existing member record
 */
async function updateExistingMember(supabase, memberId, updateData) {
  console.log(`[telegram-user-manager] Member exists, updating: ID=${memberId}`);
  
  // Update existing member
  const { data, error } = await supabase
    .from("telegram_chat_members")
    .update(updateData)
    .eq("id", memberId)
    .select();

  if (error) {
    console.error(`[telegram-user-manager] Error updating member:`, error);
    return { success: false, error: error.message };
  }

  console.log(`[telegram-user-manager] Member updated successfully:`, JSON.stringify(data, null, 2));
  return { success: true, data, isNew: false };
}

/**
 * Create a new member record
 */
async function createNewMember(supabase, memberData) {
  console.log(`[telegram-user-manager] Member doesn't exist, creating new member`);
  
  // Create new member
  const { data, error } = await supabase
    .from("telegram_chat_members")
    .insert(memberData)
    .select();

  if (error) {
    console.error(`[telegram-user-manager] Error creating member:`, error);
    return { success: false, error: error.message };
  }

  console.log(`[telegram-user-manager] Member created successfully:`, JSON.stringify(data, null, 2));
  return { success: true, data, isNew: true };
}
