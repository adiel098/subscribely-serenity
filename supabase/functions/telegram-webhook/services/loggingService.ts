
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Creates a logger instance for a specific module
 * @param supabase Supabase client instance
 * @param module The module name to identify log entries
 * @returns Logging functions for different log levels
 */
export const createLogger = (
  supabase: ReturnType<typeof createClient>,
  module: string
) => {
  const log = async (level: string, message: string, details?: any) => {
    console.log(`[${module}] [${level}] ${message}`);
    
    try {
      await supabase
        .from('system_logs')
        .insert({
          module: module,
          event_type: level.toLowerCase(),
          message: message,
          metadata: details ? (typeof details === 'object' ? details : { value: details }) : {}
        });
    } catch (error) {
      console.error(`Error writing to system_logs:`, error);
      // Continue execution even if logging fails
    }
  };

  return {
    info: (message: string, details?: any) => log('INFO', message, details),
    success: (message: string, details?: any) => log('SUCCESS', message, details),
    warn: (message: string, details?: any) => log('WARNING', message, details),
    error: (message: string, details?: any) => log('ERROR', message, details),
  };
};
