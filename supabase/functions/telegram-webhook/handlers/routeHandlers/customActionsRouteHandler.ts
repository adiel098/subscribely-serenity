
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleMemberRemoval } from '../../services/memberRemovalService.ts';
import { handleMemberUnblock } from '../../services/memberUnblockService.ts';
import { corsHeaders } from '../../cors.ts';

/**
 * Handler for custom action routes like member removal or unblocking
 */
export async function handleCustomActionsRoute(
  supabase: ReturnType<typeof createClient>,
  path: string,
  body: any,
  botToken: string
): Promise<{ handled: boolean, response?: Response }> {
  // Route: Member Removal
  if (path === '/remove-member') {
    console.log('[CUSTOM-ACTIONS] 🔄 Routing to member removal handler');
    
    // Validate that we have the required parameters
    if (!body.chat_id || !body.user_id) {
      console.error('[CUSTOM-ACTIONS] ❌ Missing required parameters for member removal:', body);
      
      return { 
        handled: true,
        response: new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: chat_id and user_id are required' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      };
    }
    
    const response = await handleMemberRemoval(
      supabase,
      body.chat_id,
      body.user_id,
      botToken
    );
    
    return { handled: true, response };
  }

  // Route: Member Unblock
  if (path === '/unblock-member') {
    console.log('[CUSTOM-ACTIONS] 🔄 Routing to member unblock handler');
    
    // Validate that we have the required parameters
    if (!body.chat_id || !body.user_id) {
      console.error('[CUSTOM-ACTIONS] ❌ Missing required parameters for member unblock:', body);
      
      return { 
        handled: true,
        response: new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: chat_id and user_id are required' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      };
    }
    
    const response = await handleMemberUnblock(
      supabase,
      body.chat_id,
      body.user_id,
      botToken
    );
    
    return { handled: true, response };
  }
  
  return { handled: false };
}
