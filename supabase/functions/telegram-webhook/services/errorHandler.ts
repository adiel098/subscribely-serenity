
/**
 * Error handling service for consistent error responses
 */

import { corsHeaders } from "../cors.ts";

/**
 * Create a consistent error response
 * @param message Error message
 * @param details Additional error details
 * @param status HTTP status code
 * @returns Response object
 */
export function createErrorResponse(
  message: string,
  details?: any,
  status = 500
) {
  const body = {
    error: message,
    details: details || "No additional details provided",
    timestamp: new Date().toISOString()
  };
  
  console.error(`Error [${status}]:`, message, details || "");
  
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      }
    }
  );
}
