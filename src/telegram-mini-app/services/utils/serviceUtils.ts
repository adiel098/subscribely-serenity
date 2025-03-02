
/**
 * Shared utility functions for services
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Log service actions with consistent formatting
 */
export const logServiceAction = (action: string, data?: any) => {
  console.log(`🔧 SERVICE: ${action}`, data ? data : '');
};

/**
 * Validate Telegram ID format (must be numeric string)
 */
export const validateTelegramId = (telegramId: string): boolean => {
  if (!telegramId || telegramId.trim() === '') {
    console.error('❌ Empty or null Telegram ID');
    return false;
  }
  
  // Format and validate the ID
  const formattedId = String(telegramId).trim();
  const isValid = /^\d+$/.test(formattedId);
  
  if (!isValid) {
    console.error('❌ Invalid Telegram ID format:', telegramId);
  } else {
    console.log('✅ Valid Telegram ID format:', telegramId);
  }
  
  return isValid;
};

/**
 * Invoke Supabase Edge Functions with consistent error handling
 * @param functionName Name of the Supabase Edge Function to invoke
 * @param payload Data to send to the function
 * @returns Promise with the function response
 */
export const invokeSupabaseFunction = async (functionName: string, payload: any) => {
  logServiceAction(`Invoking Edge Function: ${functionName}`, payload);
  
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });
    
    if (error) {
      console.error(`❌ Edge Function Error (${functionName}):`, error);
      return { data: null, error };
    }
    
    logServiceAction(`Edge Function Response (${functionName}):`, data);
    return { data, error: null };
  } catch (err) {
    console.error(`❌ Edge Function Exception (${functionName}):`, err);
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error occurred' } 
    };
  }
};
