import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const params = await req.json();
    const { action, telegram_user_id, table_name, plan_id } = params;

    console.log(`Running database diagnostics: ${action}`, params);
    
    let result;

    switch (action) {
      case "check_user_exists":
        if (!telegram_user_id) {
          throw new Error("telegram_user_id is required");
        }
        
        // Check if user exists in telegram_mini_app_users
        const { data: userData, error: userError } = await supabase
          .from('telegram_mini_app_users')
          .select('*')
          .eq('telegram_id', telegram_user_id)
          .limit(1);
          
        result = {
          userExists: userData && userData.length > 0,
          userData: userData && userData.length > 0 ? userData[0] : null,
          error: userError ? userError.message : null
        };
        break;

      case "check_user_payments":
        if (!telegram_user_id) {
          throw new Error("telegram_user_id is required");
        }
        
        // First check if user exists
        const { data: userExists, error: userExistsError } = await supabase
          .from('telegram_mini_app_users')
          .select('id')
          .eq('telegram_id', telegram_user_id)
          .limit(1);
        
        // Then check user payments
        const { data: paymentData, error: paymentError } = await supabase
          .from('subscription_payments')
          .select(`
            id, 
            plan_id, 
            amount, 
            status,
            created_at,
            payment_method
          `)
          .eq('telegram_user_id', telegram_user_id)
          .order('created_at', { ascending: false });
          
        // Also check direct join with subscription_plans
        const { data: joinData, error: joinError } = await supabase
          .from('subscription_payments')
          .select(`
            id,
            plan_id,
            plan:subscription_plans!plan_id(id, name)
          `)
          .eq('telegram_user_id', telegram_user_id)
          .limit(3);
          
        result = {
          userExists: userExists && userExists.length > 0,
          userExistsError: userExistsError ? userExistsError.message : null,
          paymentsCount: paymentData ? paymentData.length : 0,
          payments: paymentData ? paymentData.slice(0, 3) : [],
          paymentError: paymentError ? paymentError.message : null,
          joinTest: joinData,
          joinError: joinError ? joinError.message : null
        };
        break;

      case "table_info":
        if (!table_name) {
          throw new Error("table_name is required");
        }
        
        // Check table structure
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('get_table_info', { table_name });
          
        // Also get a sample of the data
        const { data: sampleData, error: sampleError } = await supabase
          .from(table_name)
          .select('*')
          .limit(3);
          
        result = {
          tableExists: !tableError,
          columns: tableInfo,
          tableError: tableError ? tableError.message : null,
          sampleData,
          sampleError: sampleError ? sampleError.message : null
        };
        break;
        
      case "check_plan_details":
        if (!plan_id) {
          throw new Error("plan_id is required");
        }
        
        // Get the plan details
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', plan_id)
          .limit(1);
          
        // Check if any payments are associated with this plan
        const { data: planPayments, error: planPaymentsError } = await supabase
          .from('subscription_payments')
          .select('id, created_at, status')
          .eq('plan_id', plan_id)
          .limit(5);
          
        result = {
          planExists: planData && planData.length > 0,
          planDetails: planData && planData.length > 0 ? planData[0] : null,
          planError: planError ? planError.message : null,
          associatedPayments: planPayments,
          paymentCount: planPayments ? planPayments.length : 0,
          planPaymentsError: planPaymentsError ? planPaymentsError.message : null
        };
        break;

      case "check_table_constraints":
        if (!table_name) {
          throw new Error("table_name is required");
        }
        
        // Get the table constraints
        const { data: constraints, error: constraintsError } = await supabase
          .rpc('get_table_constraints', { table_name });
          
        // Also get the table structure
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('get_table_info', { table_name });
          
        // Get a sample of the data
        const { data: sampleData, error: sampleError } = await supabase
          .from(table_name)
          .select('*')
          .limit(3);
          
        result = {
          tableExists: !tableError,
          columns: tableInfo,
          constraints: constraints,
          tableError: tableError ? tableError.message : null,
          constraintsError: constraintsError ? constraintsError.message : null,
          sampleData,
          sampleError: sampleError ? sampleError.message : null
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in database diagnostics:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// Helper function stub - need to implement this or use Deno approach
// to get table information
function get_table_info(table_name: string) {
  // Implementation would depend on the database access available in edge function
  return `Table: ${table_name}`;
}
