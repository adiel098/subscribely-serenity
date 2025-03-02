
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
 * Validates that the Telegram ID is in the correct format (numeric string)
 */
export function validateTelegramId(telegramUserId: string | null | undefined): boolean {
  if (!telegramUserId) {
    console.error("❌ validateTelegramId: Missing Telegram ID");
    return false;
  }
  
  // Convert to string and trim any whitespace
  const stringId = String(telegramUserId).trim();
  console.log('🔍 Validating Telegram ID:', stringId, 'type:', typeof stringId);
  
  // Check if it's a numeric string (Telegram IDs are always numeric)
  const isValid = /^\d+$/.test(stringId);
  
  if (!isValid) {
    console.error("❌ validateTelegramId: Invalid Telegram ID format:", stringId);
  } else {
    console.log('✅ validateTelegramId: Valid Telegram ID:', stringId);
  }
  
  return isValid;
}

/**
 * Invoke Supabase Edge Functions with consistent error handling
 * @param functionName Name of the Supabase Edge Function to invoke
 * @param payload Data to send to the function
 * @returns Promise with the function response
 */
export const invokeSupabaseFunction = async (functionName: string, payload: any) => {
  logServiceAction(`Invoking Edge Function: ${functionName}`, payload);
  
  try {
    console.log(`📤 PAYLOAD TO ${functionName}:`, JSON.stringify(payload, null, 2));
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });
    
    if (error) {
      console.error(`❌ Edge Function Error (${functionName}):`, error);
      console.error(`❌ Payload that caused error:`, JSON.stringify(payload, null, 2));
      return { data: null, error };
    }
    
    console.log(`📥 RESPONSE FROM ${functionName}:`, JSON.stringify(data, null, 2));
    logServiceAction(`Edge Function Response (${functionName}):`, data);
    return { data, error: null };
  } catch (err) {
    console.error(`❌ Edge Function Exception (${functionName}):`, err);
    console.error(`❌ Payload that caused exception:`, JSON.stringify(payload, null, 2));
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error occurred' } 
    };
  }
};
