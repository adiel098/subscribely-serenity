
import { supabase } from "@/integrations/supabase/client";

export function logServiceAction(action: string, params?: any): void {
  console.log(`Service Action: ${action}`, params || '');
}

export function validateTelegramId(telegramUserId: string | undefined): boolean {
  if (!telegramUserId) {
    console.error(`validateTelegramId: No telegram user ID provided`);
    return false;
  }
  
  // Validate user ID format - must be a numeric string
  if (!/^\d+$/.test(telegramUserId)) {
    console.error(`validateTelegramId: Invalid Telegram ID format: ${telegramUserId}`);
    return false;
  }
  
  return true;
}

export function invokeSupabaseFunction(functionName: string, payload: any) {
  return supabase.functions.invoke(functionName, {
    body: payload
  });
}

