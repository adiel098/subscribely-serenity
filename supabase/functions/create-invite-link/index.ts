
import { corsHeaders } from "./utils/corsHeaders.ts";
import { handleInviteLink } from "./handlers/inviteLinkHandler.ts";

// This is needed to handle CORS preflight requests
if (Deno.env.get("SUPABASE_URL") === undefined) {
  console.error("Missing SUPABASE_URL environment variable");
}

if (Deno.env.get("SUPABASE_ANON_KEY") === undefined) {
  console.error("Missing SUPABASE_ANON_KEY environment variable");
}

// Handle HTTP OPTIONS request for CORS
const handleOptions = () => {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    // Process the invite link request
    return await handleInviteLink(req);
  } catch (error) {
    console.error("Unhandled error in create-invite-link function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
