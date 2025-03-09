
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Logs database operations to help with debugging and tracking
 */
export async function logDbOperation(
  supabase: ReturnType<typeof createClient>,
  operation: string,
  tableName: string,
  data: any,
  result: any,
  error: any = null
) {
  try {
    console.log(`[DB-LOGGER] 📝 ${operation} operation on ${tableName}:`);
    console.log(`[DB-LOGGER] Input data:`, JSON.stringify(data, null, 2));
    
    if (error) {
      console.error(`[DB-LOGGER] ❌ Error:`, error);
    } else {
      console.log(`[DB-LOGGER] ✅ Result:`, JSON.stringify(result, null, 2));
    }
    
    // Log to database for persistent records
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'database_operation',
        details: `${operation} on ${tableName}`,
        metadata: {
          operation,
          table: tableName,
          data,
          result: error ? null : result,
          error: error ? JSON.stringify(error) : null,
          timestamp: new Date().toISOString()
        }
      });
      
  } catch (logError) {
    console.error('[DB-LOGGER] ❌ Error logging operation:', logError);
  }
}

/**
 * Central function to create or update member records
 */
export async function createOrUpdateMember(
  supabase: ReturnType<typeof createClient>,
  memberData: {
    telegram_user_id: string;
    telegram_username?: string | null;
    community_id: string;
    subscription_status?: boolean;
    subscription_plan_id?: string | null;
    subscription_start_date?: string | null;
    subscription_end_date?: string | null;
    is_active?: boolean;
  }
) {
  try {
    console.log(`[DB-LOGGER] 🧑‍💼 Creating/updating member record:`, JSON.stringify(memberData, null, 2));
    
    // Use upsert to either insert or update based on the unique constraint
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .upsert({
        ...memberData,
        last_active: new Date().toISOString(),
        is_active: memberData.is_active !== undefined ? memberData.is_active : true
      }, {
        onConflict: 'telegram_user_id,community_id'
      })
      .select();
      
    await logDbOperation(
      supabase, 
      'upsert', 
      'telegram_chat_members', 
      memberData, 
      data, 
      error
    );
    
    if (error) {
      console.error('[DB-LOGGER] ❌ Error creating/updating member:', error);
      return { success: false, error, data: null };
    }
    
    console.log('[DB-LOGGER] ✅ Member record created/updated successfully');
    return { success: true, error: null, data };
  } catch (error) {
    console.error('[DB-LOGGER] ❌ Unexpected error in createOrUpdateMember:', error);
    return { success: false, error, data: null };
  }
}
