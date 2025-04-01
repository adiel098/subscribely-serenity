
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
    try {
      console.log(`[${module}] [${level}] ${message}`);
      
      if (details) {
        if (typeof details === 'object') {
          console.log(`[${module}] [${level}] Details:`, details);
        } else {
          console.log(`[${module}] [${level}] Details: ${details}`);
        }
      }
      
      try {
        await supabase
          .from('system_logs')
          .insert({
            module: module,
            event_type: level.toLowerCase(),
            message: message,
            metadata: details ? (typeof details === 'object' ? details : { value: details }) : {}
          });
      } catch (dbError) {
        console.error(`[${module}] Error writing to system_logs:`, dbError);
        // Continue execution even if logging to DB fails
      }
    } catch (consoleError) {
      // Last resort fallback if even console logging fails
      console.error("Logger error:", consoleError);
    }
  };

  return {
    info: (message: string, details?: any) => log('INFO', message, details),
    success: (message: string, details?: any) => log('SUCCESS', message, details), // Added success method
    warn: (message: string, details?: any) => log('WARNING', message, details),
    error: (message: string, details?: any) => log('ERROR', message, details),
    debug: (message: string, details?: any) => log('DEBUG', message, details), // Added debug method
  };
};
