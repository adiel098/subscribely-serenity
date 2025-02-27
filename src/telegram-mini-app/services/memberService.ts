
import { supabase } from "@/integrations/supabase/client";
import { CreateMemberData } from "../types/payment.types";

/**
 * Create or update a community member based on Telegram user ID
 * This function handles connecting a payment to a Telegram user
 */
export const createOrUpdateMember = async (data: CreateMemberData) => {
  try {
    const { 
      community_id, 
      telegram_id, 
      subscription_plan_id, 
      status = 'active',
      payment_id 
    } = data;
    
    if (!telegram_id || !community_id) {
      throw new Error("Telegram ID and Community ID are required");
    }

    console.log('Creating/updating member:', {
      telegram_id,
      community_id,
      subscription_plan_id,
      status
    });

    // First, check if the member already exists
    const { data: existingMember, error: queryError } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', community_id)
      .eq('telegram_id', telegram_id)
      .maybeSingle();
      
    if (queryError) {
      console.error('Error checking for existing member:', queryError);
      throw queryError;
    }
    
    const now = new Date();
    // Default subscription period - 30 days from now
    const defaultEndDate = new Date();
    defaultEndDate.setDate(now.getDate() + 30); 

    if (existingMember) {
      // Update existing member
      const { error: updateError } = await supabase
        .from('community_members')
        .update({
          status: status,
          subscription_plan_id: subscription_plan_id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: defaultEndDate.toISOString(),
          updated_at: now.toISOString(),
          payment_id: payment_id || existingMember.payment_id
        })
        .eq('id', existingMember.id);

      if (updateError) {
        console.error('Error updating member:', updateError);
        throw updateError;
      }
      
      return { id: existingMember.id, updated: true };
    } else {
      // Create new member
      const { data: newMember, error: insertError } = await supabase
        .from('community_members')
        .insert({
          community_id: community_id,
          telegram_id: telegram_id,
          status: status,
          subscription_plan_id: subscription_plan_id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: defaultEndDate.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          payment_id: payment_id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating member:', insertError);
        throw insertError;
      }
      
      return { id: newMember.id, updated: false };
    }
  } catch (error) {
    console.error('Error in createOrUpdateMember:', error);
    throw error;
  }
};

/**
 * Alias for createOrUpdateMember to maintain compatibility with existing code
 */
export const createMember = createOrUpdateMember;
