
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "../types/app.types";

export const createOrUpdateMember = async (
  telegramUser: TelegramUser,
  communityId: string,
  email?: string
) => {
  try {
    // First check if the user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error checking if user exists:", fetchError);
      throw fetchError;
    }
    
    if (existingUser) {
      // Update existing user
      const updateData: any = {
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
      };
      
      // Only update email if provided and not already set
      if (email && !existingUser.email) {
        updateData.email = email;
      }
      
      // Only update community_id if provided and not already set
      if (communityId && !existingUser.community_id) {
        updateData.community_id = communityId;
      }
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('telegram_mini_app_users')
        .update(updateData)
        .eq('telegram_id', telegramUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating user:", updateError);
        throw updateError;
      }
      
      return updatedUser;
    } else {
      // Create new user
      const newUser = {
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        email: email,
        community_id: communityId
      };
      
      const { data: createdUser, error: createError } = await supabase
        .from('telegram_mini_app_users')
        .insert([newUser])
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }
      
      return createdUser;
    }
  } catch (error) {
    console.error("Error in createOrUpdateMember:", error);
    throw error;
  }
};
