
/**
 * Shared utility functions for services
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Log service actions with consistent formatting and emojis
 */
export const logServiceAction = (action: string, data?: any) => {
  console.log(`🔧 SERVICE: ${action} 📊`, data ? JSON.stringify(data, null, 2) : '');
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
 * Invoke Supabase Edge Functions with consistent error handling and improved logging
 * @param functionName Name of the Supabase Edge Function to invoke
 * @param payload Data to send to the function
 * @returns Promise with the function response
 */
export const invokeSupabaseFunction = async (functionName: string, payload: any) => {
  logServiceAction(`🚀 Invoking Edge Function: ${functionName}`, payload);
  
  try {
    console.time(`⏱️ ${functionName} execution time`);
    console.log(`📤 PAYLOAD TO ${functionName}:`, JSON.stringify(payload, null, 2));
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });
    
    console.timeEnd(`⏱️ ${functionName} execution time`);
    
    if (error) {
      console.error(`❌ Edge Function Error (${functionName}):`, error);
      console.error(`❌ Payload that caused error:`, JSON.stringify(payload, null, 2));
      return { data: null, error };
    }
    
    console.log(`📥 RESPONSE FROM ${functionName}:`, JSON.stringify(data, null, 2));
    
    // Log data structure and types for better debugging
    if (data) {
      console.log(`📊 Response structure for ${functionName}:`);
      Object.keys(data).forEach(key => {
        const value = data[key];
        console.log(`   🔑 ${key}: ${Array.isArray(value) ? `Array[${value.length}]` : typeof value}`);
        
        // For arrays, log their contents type
        if (Array.isArray(value) && value.length > 0) {
          console.log(`      📋 First item type: ${typeof value[0]}`);
          console.log(`      📋 Sample:`, JSON.stringify(value[0], null, 2));
        }
      });
    }
    
    logServiceAction(`✅ Edge Function Response (${functionName}):`, data);
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
