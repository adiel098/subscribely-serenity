
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './services/loggingService.ts';

/**
 * Log Telegram webhook events with improved error handling
 * @param supabase Supabase client
 * @param eventType Type of the event
 * @param data Event data to log
 */
export async function logTelegramEvent(supabase: ReturnType<typeof createClient>, eventType: string, data: any) {
  const logger = createLogger(supabase, 'EVENT-LOGGER');
  
  try {
    if (!supabase) {
      await logger.error('Missing Supabase client');
      return;
    }

    if (!eventType) {
      await logger.error('Missing event type');
      return;
    }

    await logger.info(`Logging event type: ${eventType}`);
    
    // Handle null or undefined data
    if (data === null || data === undefined) {
      await logger.warn('Event data is null or undefined, logging empty object instead');
      data = {}; // Use empty object instead of null
    }
    
    // Truncate or modify data if needed to avoid excessive storage
    let processedData = data;
    
    // For large payloads, we might want to trim them down
    if (typeof data === 'object' && data !== null) {
      try {
        // Clone the data to avoid modifying the original
        processedData = JSON.parse(JSON.stringify(data));
        
        // If there's a large text field, truncate it
        if (processedData.message?.text && processedData.message.text.length > 1000) {
          processedData.message.text = processedData.message.text.substring(0, 1000) + '... (truncated)';
        }
        
        // Add timestamp to the log
        processedData._logged_at = new Date().toISOString();
      } catch (jsonError) {
        await logger.error('Error processing JSON data:', jsonError);
        // If JSON processing fails, use a simple object with error info
        processedData = { 
          original_data_error: 'Could not process original data',
          error_message: jsonError.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Try to insert the log with better error handling for RLS
    try {
      const { error } = await supabase
        .from('telegram_webhook_logs')
        .insert([
          {
            event_type: eventType,
            raw_data: processedData
          }
        ]);

      if (error) {
        // Check if it's an RLS error
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          await logger.warn('RLS policy prevented logging event. This is expected in some contexts.');
        } else {
          await logger.error('Error logging event:', error);
        }
      } else {
        await logger.success('Event logged successfully');
      }
    } catch (dbError) {
      await logger.error('Database error in logTelegramEvent:', dbError);
    }
  } catch (error) {
    console.error('[EVENT-LOGGER] ❌ Error in logTelegramEvent:', error);
  }
}

/**
 * Log detailed user interactions for better analytics
 */
export async function logUserAction(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  action: string,
  details: any
) {
  const logger = createLogger(supabase, 'USER-ACTION');
  
  try {
    if (!supabase) {
      await logger.error('Missing Supabase client');
      return;
    }

    if (!telegramUserId) {
      await logger.error('Missing telegramUserId');
      return;
    }

    if (!action) {
      await logger.error('Missing action');
      return;
    }

    await logger.info(`Logging user action: ${action} for user ${telegramUserId}`);
    
    // Ensure details is not null or undefined
    const safeDetails = details || {};
    
    // Try fallback tables if the main one has RLS issues
    try {
      const { error } = await supabase
        .from('subscription_activity_logs')
        .insert([
          {
            telegram_user_id: telegramUserId,
            activity_type: action,
            details: JSON.stringify(safeDetails)
          }
        ]);
        
      if (error) {
        // Check if it's an RLS error
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          await logger.warn('RLS policy prevented logging user action. This is expected in some contexts.');
        } else {
          await logger.error('Error logging user action:', error);
        }
      } else {
        await logger.success('User action logged successfully');
      }
    } catch (error) {
      await logger.error('Error logging to activity logs:', error);
    }
  } catch (error) {
    await logger.error('Error in logUserAction:', error);
  }
}
