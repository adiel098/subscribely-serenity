
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Creates a logging service for consistent logging to database and console
 * @param supabase Supabase client
 * @param module Module name for log context
 */
export function createLogger(supabase: ReturnType<typeof createClient>, module: string) {
  const logToConsole = (level: string, message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`);
  };

  const logToDatabase = async (level: string, message: string, metadata?: any) => {
    try {
      await supabase.from('system_logs').insert({
        event_type: `${module}_${level.toUpperCase()}`,
        details: message,
        metadata: metadata || {}
      });
    } catch (error) {
      console.error('Failed to write to system_logs:', error);
    }
  };

  return {
    info: async (message: string, metadata?: any) => {
      logToConsole('info', message);
      await logToDatabase('info', message, metadata);
    },
    warn: async (message: string, metadata?: any) => {
      logToConsole('warn', message);
      await logToDatabase('warn', message, metadata);
    },
    error: async (message: string, metadata?: any) => {
      logToConsole('error', message);
      await logToDatabase('error', message, metadata);
    },
    success: async (message: string, metadata?: any) => {
      logToConsole('success', message);
      await logToDatabase('success', message, metadata);
    }
  };
}
