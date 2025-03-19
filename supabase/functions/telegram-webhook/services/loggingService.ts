
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
  const log = async (level: string, message: string) => {
    console.log(`[${module}] [${level}] ${message}`);
    
    try {
      await supabase
        .from('system_logs')
        .insert({
          module: module,
          event_type: level.toLowerCase(),
          message: message,
          metadata: {}
        });
    } catch (error) {
      console.error(`Error writing to system_logs:`, error);
      // Continue execution even if logging fails
    }
  };

  return {
    info: (message: string) => log('INFO', message),
    success: (message: string) => log('SUCCESS', message),
    warn: (message: string) => log('WARNING', message),
    error: (message: string) => log('ERROR', message),
  };
};
