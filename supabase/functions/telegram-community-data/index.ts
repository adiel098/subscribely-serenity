
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { createErrorResponse } from "./utils/response.ts";
import { logger } from "./utils/logger.ts";
import { handleCommunityRequest, CommunityRequestPayload } from "./middleware/requestHandler.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let payload: CommunityRequestPayload;
    try {
      payload = await req.json();
    } catch (error) {
      logger.error("Invalid request body", error);
      return createErrorResponse("Invalid request body", error, 400);
    }

    // Process the request
    return await handleCommunityRequest(payload);
  } catch (error) {
    logger.error("Unexpected error:", error);
    return createErrorResponse("Internal server error", error.message);
  }
});
