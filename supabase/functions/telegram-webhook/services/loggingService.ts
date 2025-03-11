
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Creates a logger instance for consistent logging across functions
 * @param supabase The Supabase client
 * @param context The context for the logs (e.g., 'WEBHOOK', 'INVITE-HANDLER')
 * @returns Object with logging methods
 */
export function createLogger(supabase: ReturnType<typeof createClient>, context: string) {
  const logToConsole = (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${context}] [${level}]`;
    
    if (data) {
      console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data) : data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  };
  
  const logToDatabase = async (level: string, message: string, data?: any) => {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          event_type: `${context}_${level}`,
          details: message,
          metadata: data ? (typeof data === 'object' ? data : { value: data }) : {}
        });
        
      if (error) {
        console.error(`[${context}] Failed to log to database:`, error);
      }
    } catch (err) {
      console.error(`[${context}] Exception in database logging:`, err);
    }
  };
  
  return {
    info: async (message: string, data?: any) => {
      logToConsole('INFO', message, data);
      await logToDatabase('INFO', message, data);
    },
    
    warn: async (message: string, data?: any) => {
      logToConsole('WARN', message, data);
      await logToDatabase('WARN', message, data);
    },
    
    error: async (message: string, data?: any) => {
      logToConsole('ERROR', message, data);
      await logToDatabase('ERROR', message, data);
    },
    
    success: async (message: string, data?: any) => {
      logToConsole('SUCCESS', message, data);
      await logToDatabase('SUCCESS', message, data);
    },
    
    debug: async (message: string, data?: any) => {
      // Only log to console in development
      logToConsole('DEBUG', message, data);
      // Don't store debug logs in the database to reduce noise
    }
  };
}
