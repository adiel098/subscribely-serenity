
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    console.log('Starting database diagnostics function')
    
    // Initialize the Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Extract request body
    const requestData = await req.json()
    const { action, telegram_user_id, table_name } = requestData
    
    console.log(`Received request: action=${action}, telegram_user_id=${telegram_user_id}, table=${table_name}`)
    
    if (!action) {
      throw new Error('Action parameter is required')
    }
    
    // Perform the requested action
    let result = null
    
    if (action === 'check_user_exists') {
      if (!telegram_user_id) {
        throw new Error('telegram_user_id parameter is required for check_user_exists action')
      }
      
      console.log(`Checking if user with telegram_user_id=${telegram_user_id} exists`)
      
      // Check if the user exists in telegram_mini_app_users
      const { data: miniAppUser, error: miniAppUserError } = await supabase
        .from('telegram_mini_app_users')
        .select('id, telegram_id, username, first_name, last_name')
        .eq('telegram_id', telegram_user_id)
        .limit(1)
      
      if (miniAppUserError) {
        console.error('Error checking telegram_mini_app_users:', miniAppUserError)
      } else {
        console.log(`Found ${miniAppUser?.length || 0} records in telegram_mini_app_users`)
      }
      
      // Check if the user exists in telegram_chat_members
      const { data: chatMember, error: chatMemberError } = await supabase
        .from('telegram_chat_members')
        .select('id, telegram_user_id, telegram_username, community_id')
        .eq('telegram_user_id', telegram_user_id)
        .limit(5)
      
      if (chatMemberError) {
        console.error('Error checking telegram_chat_members:', chatMemberError)
      } else {
        console.log(`Found ${chatMember?.length || 0} records in telegram_chat_members`)
      }
      
      result = {
        miniAppUser: {
          exists: miniAppUser && miniAppUser.length > 0,
          data: miniAppUser,
          error: miniAppUserError ? miniAppUserError.message : null
        },
        chatMember: {
          exists: chatMember && chatMember.length > 0,
          data: chatMember,
          error: chatMemberError ? chatMemberError.message : null
        }
      }
    } 
    else if (action === 'check_user_payments') {
      if (!telegram_user_id) {
        throw new Error('telegram_user_id parameter is required for check_user_payments action')
      }
      
      console.log(`Checking payments for user with telegram_user_id=${telegram_user_id}`)
      
      // Check direct payments in subscription_payments
      const { data: payments, error: paymentsError } = await supabase
        .from('subscription_payments')
        .select(`
          id, 
          telegram_user_id, 
          amount, 
          status, 
          payment_method, 
          created_at
        `)
        .eq('telegram_user_id', telegram_user_id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (paymentsError) {
        console.error('Error checking subscription_payments:', paymentsError)
      } else {
        console.log(`Found ${payments?.length || 0} payment records`)
        if (payments && payments.length > 0) {
          console.log('First payment record:', payments[0])
        }
      }
      
      // Also check if there's a payment record but with a different ID format
      const { data: paymentsByLike, error: paymentsByLikeError } = await supabase
        .from('subscription_payments')
        .select('id, telegram_user_id, created_at')
        .ilike('telegram_user_id', `%${telegram_user_id}%`)
        .limit(5)
      
      if (paymentsByLikeError) {
        console.error('Error checking subscription_payments with LIKE:', paymentsByLikeError)
      } else if (paymentsByLike && paymentsByLike.length > 0) {
        console.log(`Found ${paymentsByLike.length} payments with similar telegram_user_id. First record:`, paymentsByLike[0])
      }
      
      // Also look for the format of telegram_user_id in the table
      const { data: samplePayments, error: sampleError } = await supabase
        .from('subscription_payments')
        .select('telegram_user_id')
        .limit(5)
      
      if (sampleError) {
        console.error('Error fetching sample payments:', sampleError)
      } else {
        console.log('Sample telegram_user_id formats in the database:', samplePayments?.map(p => p.telegram_user_id))
      }
      
      result = {
        payments: {
          count: payments?.length || 0,
          data: payments,
          error: paymentsError ? paymentsError.message : null
        },
        similarIds: {
          count: paymentsByLike?.length || 0,
          data: paymentsByLike,
          error: paymentsByLikeError ? paymentsByLikeError.message : null
        },
        sampleFormats: samplePayments?.map(p => p.telegram_user_id) || []
      }
    }
    else if (action === 'table_info') {
      if (!table_name) {
        throw new Error('table_name parameter is required for table_info action')
      }
      
      console.log(`Getting table info for ${table_name}`)
      
      // Check if the table exists and get a sample of records
      const { data: tableData, error: tableError } = await supabase
        .from(table_name)
        .select('*')
        .limit(2)
      
      if (tableError) {
        console.error(`Error checking table ${table_name}:`, tableError)
        result = {
          exists: false,
          error: tableError.message
        }
      } else {
        console.log(`Table ${table_name} exists with ${tableData?.length || 0} sample records`)
        
        // Get the count of records in the table
        const { count, error: countError } = await supabase
          .from(table_name)
          .select('*', { count: 'exact', head: true })
        
        if (countError) {
          console.error(`Error getting count for table ${table_name}:`, countError)
        } else {
          console.log(`Table ${table_name} has ${count} total records`)
        }
        
        result = {
          exists: true,
          sampleData: tableData,
          totalRecords: count,
          countError: countError ? countError.message : null
        }
      }
    }
    else {
      throw new Error(`Unknown action: ${action}`)
    }
    
    console.log('Diagnostics completed successfully')
    
    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Error in database-diagnostics function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
}
