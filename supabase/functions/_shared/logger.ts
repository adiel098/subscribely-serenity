
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export function createLogger(supabase: ReturnType<typeof createClient>, namespace: string) {
  const log = async (level: string, message: string) => {
    console.log(`[${namespace}] ${level}: ${message}`);
    
    try {
      // Log to system_logs table if it exists
      await supabase
        .from('system_logs')
        .insert({
          event_type: `${namespace}_${level.toUpperCase()}`,
          details: message,
          metadata: { namespace }
        })
        .catch(err => {
          // Silently fail if table doesn't exist or other issues
          console.error(`Failed to insert log: ${err.message}`);
        });
    } catch (error) {
      // Don't let logging failures cause issues
      console.error(`Error logging to database: ${error.message}`);
    }
  };

  return {
    info: (message: string) => log('info', message),
    warn: (message: string) => log('warn', message),
    error: (message: string) => log('error', message),
    success: (message: string) => log('success', message),
  };
}
