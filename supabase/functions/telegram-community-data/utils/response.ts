
import { corsHeaders } from "./cors.ts";

/**
 * Creates a standardized success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data
    }),
    {
      headers: corsHeaders,
      status
    }
  );
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(message: string, details: any = null, status: number = 500) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details
    }),
    {
      headers: corsHeaders,
      status
    }
  );
}

/**
 * Creates a standardized not found response
 */
export function createNotFoundResponse(message: string = "Resource not found") {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      headers: corsHeaders,
      status: 404
    }
  );
}
