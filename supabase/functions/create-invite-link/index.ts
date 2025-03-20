
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { handleInviteLink } from "./handlers/inviteLinkHandler.ts";
import { corsHeaders } from "./utils/corsHeaders.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handleInviteLink(req);
});
