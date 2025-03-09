
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Log Telegram webhook events with improved error handling
 * @param supabase Supabase client
 * @param eventType Type of the event
 * @param data Event data to log
 */
export async function logTelegramEvent(supabase: ReturnType<typeof createClient>, eventType: string, data: any) {
  try {
    if (!supabase) {
      console.error('[EVENT-LOGGER] ❌ Missing Supabase client');
      return;
    }

    if (!eventType) {
      console.error('[EVENT-LOGGER] ❌ Missing event type');
      return;
    }

    console.log(`[EVENT-LOGGER] 📝 Logging event type: ${eventType}`);
    
    // Handle null or undefined data
    if (data === null || data === undefined) {
      console.warn('[EVENT-LOGGER] ⚠️ Event data is null or undefined, logging empty object instead');
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
        console.error('[EVENT-LOGGER] ❌ Error processing JSON data:', jsonError);
        // If JSON processing fails, use a simple object with error info
        processedData = { 
          original_data_error: 'Could not process original data',
          error_message: jsonError.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Make sure the table exists before trying to log
    // First check if table exists
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('telegram_webhook_logs')
        .select('id')
        .limit(1);
        
      if (tableCheckError) {
        console.warn('[EVENT-LOGGER] ⚠️ Error checking if telegram_webhook_logs table exists, trying to create it');
        
        // Try to create the table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS telegram_webhook_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT,
            raw_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          )
        `;
        
        await supabase.rpc('create_table_if_not_exists', { 
          table_name: 'telegram_webhook_logs',
          create_sql: createTableSQL 
        });
      }
    } catch (tableError) {
      console.error('[EVENT-LOGGER] ❌ Error checking/creating telegram_webhook_logs table:', tableError);
      // Continue and try to insert anyway
    }
    
    // Try to insert the log
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
        console.error('[EVENT-LOGGER] ❌ Error logging event:', error);
        throw error;
      }
      
      console.log('[EVENT-LOGGER] ✅ Event logged successfully');
    } catch (dbError) {
      console.error('[EVENT-LOGGER] ❌ Database error in logTelegramEvent:', dbError);
      // Try to log the error itself to a different table
      try {
        await supabase.from('telegram_errors').insert({
          error_type: 'event_logging_error',
          error_message: dbError.message || 'Unknown database error',
          stack_trace: dbError.stack,
          context: { event_type: eventType }
        });
      } catch (secondaryError) {
        console.error('[EVENT-LOGGER] ❌ Failed to log error to database:', secondaryError);
      }
    }
  } catch (error) {
    console.error('[EVENT-LOGGER] ❌ Error in logTelegramEvent:', error);
    // We don't re-throw here to avoid breaking the main function flow
    // But we do try to log the error in a different table
    try {
      await supabase.from('telegram_errors').insert({
        error_type: 'event_logging_error',
        error_message: error.message || 'Unknown error',
        stack_trace: error.stack,
        context: { event_type: eventType }
      });
    } catch (secondaryError) {
      console.error('[EVENT-LOGGER] ❌ Failed to log error to database:', secondaryError);
    }
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
  try {
    if (!supabase) {
      console.error('[EVENT-LOGGER] ❌ Missing Supabase client');
      return;
    }

    if (!telegramUserId) {
      console.error('[EVENT-LOGGER] ❌ Missing telegramUserId');
      return;
    }

    if (!action) {
      console.error('[EVENT-LOGGER] ❌ Missing action');
      return;
    }

    console.log(`[EVENT-LOGGER] 📊 Logging user action: ${action} for user ${telegramUserId}`);
    
    // Ensure details is not null or undefined
    const safeDetails = details || {};
    
    // Check if user_actions table exists
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('user_actions')
        .select('id')
        .limit(1);
        
      if (tableCheckError) {
        console.warn('[EVENT-LOGGER] ⚠️ user_actions table may not exist, will try subscription_activity_logs instead');
        
        // Try to use subscription_activity_logs table as fallback
        const { error: fallbackError } = await supabase
          .from('subscription_activity_logs')
          .insert([
            {
              telegram_user_id: telegramUserId,
              activity_type: action,
              details: JSON.stringify(safeDetails)
            }
          ]);
          
        if (fallbackError) {
          console.error('[EVENT-LOGGER] ❌ Error logging to fallback table:', fallbackError);
        } else {
          console.log('[EVENT-LOGGER] ✅ User action logged to fallback table successfully');
        }
        
        return;
      }
    } catch (tableError) {
      console.error('[EVENT-LOGGER] ❌ Error checking user_actions table:', tableError);
      // Continue and try to insert anyway
    }
    
    const { error } = await supabase
      .from('user_actions')
      .insert([
        {
          telegram_user_id: telegramUserId,
          action_type: action,
          details: safeDetails
        }
      ]);
      
    if (error) {
      console.error('[EVENT-LOGGER] ❌ Error logging user action:', error);
    } else {
      console.log('[EVENT-LOGGER] ✅ User action logged successfully');
    }
  } catch (error) {
    console.error('[EVENT-LOGGER] ❌ Error in logUserAction:', error);
  }
}
