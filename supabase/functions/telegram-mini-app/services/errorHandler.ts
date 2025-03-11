
import { corsHeaders } from "../utils/corsHeaders.ts";

/**
 * Creates a standard error response
 */
export function createErrorResponse(error: Error, details: any = {}, status: number = 500) {
  console.error("Server error:", error);
  return new Response(
    JSON.stringify({
      error: error.message || "Internal server error",
      details,
    }),
    { headers: corsHeaders, status }
  );
}
