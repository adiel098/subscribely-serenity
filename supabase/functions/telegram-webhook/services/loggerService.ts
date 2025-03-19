
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Interface for logger functions
 */
export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Creates a simple logger with context information
 * @param context The context identifier for the logs
 * @returns A Logger instance
 */
export function getLogger(context: string): Logger {
  const timestamp = () => new Date().toISOString();
  
  return {
    info(message: string, ...args: any[]) {
      console.log(`[${timestamp()}] [${context}] [INFO] ${message}`, ...args);
    },
    error(message: string, ...args: any[]) {
      console.error(`[${timestamp()}] [${context}] [ERROR] ${message}`, ...args);
    },
    warn(message: string, ...args: any[]) {
      console.warn(`[${timestamp()}] [${context}] [WARN] ${message}`, ...args);
    },
    debug(message: string, ...args: any[]) {
      console.debug(`[${timestamp()}] [${context}] [DEBUG] ${message}`, ...args);
    }
  };
}

/**
 * Logs detailed information to database
 * @param supabase Supabase client
 * @param context Context identifier
 * @param level Log level
 * @param message Log message
 * @param data Additional data to log
 */
export async function logToDatabase(
  supabase: ReturnType<typeof createClient>,
  context: string,
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG',
  message: string,
  data?: any
): Promise<void> {
  try {
    await supabase.from('system_logs').insert({
      event_type: `TELEGRAM_WEBHOOK_${context}_${level}`,
      details: message,
      metadata: data ? (typeof data === 'object' ? data : { value: data }) : {}
    });
  } catch (err) {
    console.error(`[${context}] Failed to log to database:`, err);
  }
}
