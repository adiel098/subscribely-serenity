
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Centralized logging service for Telegram webhook functions
 * Provides consistent log formatting, database logging, and emoji-enhanced console logs
 */
export class LoggingService {
  private supabase: ReturnType<typeof createClient>;
  private moduleName: string;
  private enableDbLogging: boolean;
  
  constructor(
    supabase: ReturnType<typeof createClient>,
    moduleName: string,
    enableDbLogging = true
  ) {
    this.supabase = supabase;
    this.moduleName = moduleName;
    this.enableDbLogging = enableDbLogging;
  }
  
  /**
   * Log an informational message
   */
  async info(message: string, data?: any): Promise<void> {
    const logMessage = `[${this.moduleName}] ℹ️ ${message}`;
    console.log(logMessage, data !== undefined ? data : '');
    
    if (this.enableDbLogging) {
      await this.logToDatabase('info', message, data);
    }
  }
  
  /**
   * Log a success message
   */
  async success(message: string, data?: any): Promise<void> {
    const logMessage = `[${this.moduleName}] ✅ ${message}`;
    console.log(logMessage, data !== undefined ? data : '');
    
    if (this.enableDbLogging) {
      await this.logToDatabase('success', message, data);
    }
  }
  
  /**
   * Log a warning message
   */
  async warn(message: string, data?: any): Promise<void> {
    const logMessage = `[${this.moduleName}] ⚠️ ${message}`;
    console.warn(logMessage, data !== undefined ? data : '');
    
    if (this.enableDbLogging) {
      await this.logToDatabase('warning', message, data);
    }
  }
  
  /**
   * Log an error message
   */
  async error(message: string, error?: any): Promise<void> {
    const errorObj = error instanceof Error ? { 
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;
    
    const logMessage = `[${this.moduleName}] ❌ ${message}`;
    console.error(logMessage, errorObj !== undefined ? errorObj : '');
    
    if (this.enableDbLogging) {
      await this.logToDatabase('error', message, errorObj);
    }
  }
  
  /**
   * Record start of a function execution with timing
   */
  startTimer(operation: string): { end: () => Promise<number> } {
    const startTime = performance.now();
    console.log(`[${this.moduleName}] ⏱️ Starting: ${operation}`);
    
    return {
      end: async (): Promise<number> => {
        const duration = performance.now() - startTime;
        const message = `Completed: ${operation} (${duration.toFixed(2)}ms)`;
        await this.info(message);
        return duration;
      }
    };
  }
  
  /**
   * Log a message to the database
   */
  private async logToDatabase(
    level: 'info' | 'success' | 'warning' | 'error',
    message: string,
    data?: any
  ): Promise<void> {
    try {
      if (!this.supabase) return;
      
      // For error level logs, ensure we're not missing important context
      const detailedData = level === 'error' ? this.enhanceErrorData(data) : data;
      
      const { error } = await this.supabase
        .from('telegram_webhook_logs')
        .insert([
          {
            event_type: `${this.moduleName}-${level}`,
            raw_data: {
              message,
              details: detailedData,
              timestamp: new Date().toISOString(),
              module: this.moduleName
            }
          }
        ]);
      
      if (error) {
        // Don't recurse by calling this.error() again
        console.error(`[${this.moduleName}] Failed to log to database:`, error);
      }
    } catch (dbError) {
      // Silently handle database logging errors to prevent cascading failures
      console.error(`[${this.moduleName}] Exception in database logging:`, dbError);
    }
  }
  
  /**
   * Enhance error data with additional context
   */
  private enhanceErrorData(data: any): any {
    if (!data) return { unspecified: true };
    
    if (data instanceof Error) {
      return {
        message: data.message,
        name: data.name,
        stack: data.stack,
        cause: data.cause
      };
    }
    
    return data;
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(
  supabase: ReturnType<typeof createClient>,
  moduleName: string,
  enableDbLogging = true
): LoggingService {
  return new LoggingService(supabase, moduleName, enableDbLogging);
}
