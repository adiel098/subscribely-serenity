
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface Logger {
  info: (message: string) => Promise<void>;
  success: (message: string) => Promise<void>;
  warn: (message: string) => Promise<void>;
  error: (message: string) => Promise<void>;
}

/**
 * Creates a logger with consistent formatting for edge functions
 * @param supabase Supabase client
 * @param serviceName Name of the service for identifying log sources
 */
export function createLogger(
  supabase: ReturnType<typeof createClient>,
  serviceName: string
): Logger {
  const logToConsole = (level: string, emoji: string, message: string) => {
    console.log(`[${serviceName}] ${emoji} ${message}`);
  };
  
  const logToDatabase = async (level: string, message: string) => {
    try {
      await supabase.from('subscription_activity_logs').insert({
        activity_type: `log_${level.toLowerCase()}`,
        details: `[${serviceName}] ${message}`,
        telegram_user_id: '0', // System log
        community_id: '00000000-0000-0000-0000-000000000000' // System log
      });
    } catch (error) {
      console.error(`[${serviceName}] Failed to log to database:`, error);
    }
  };
  
  return {
    info: async (message: string) => {
      logToConsole('INFO', 'ℹ️', message);
      // We don't log info messages to the database to reduce noise
    },
    success: async (message: string) => {
      logToConsole('SUCCESS', '✅', message);
      await logToDatabase('SUCCESS', message);
    },
    warn: async (message: string) => {
      logToConsole('WARNING', '⚠️', message);
      await logToDatabase('WARNING', message);
    },
    error: async (message: string) => {
      logToConsole('ERROR', '❌', message);
      await logToDatabase('ERROR', message);
    }
  };
}
