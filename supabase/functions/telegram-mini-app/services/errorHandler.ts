
import { corsHeaders } from "../utils/corsHeaders.ts";

/**
 * Creates a standardized error response
 */
export function createErrorResponse(error: Error | unknown) {
  console.error("Error in telegram-mini-app function:", error);
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : "Unknown error occurred";
  
  return new Response(
    JSON.stringify({
      error: "Internal server error",
      details: errorMessage,
    }),
    { headers: corsHeaders, status: 500 }
  );
}
