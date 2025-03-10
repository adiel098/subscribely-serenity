
import { corsHeaders } from './cors.ts';
import { logger } from './logger.ts';

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data: any) {
  logger.debug(`Creating success response with data:`, data);
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, details: any = null, status = 500) {
  logger.error(`Creating error response: ${message}`, details);
  return new Response(
    JSON.stringify({ 
      error: message,
      details: details
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status 
    }
  );
}

/**
 * Create a standardized not found response
 */
export function createNotFoundResponse(message: string, params: any = null) {
  logger.warn(`Creating not found response: ${message}`, params);
  return new Response(
    JSON.stringify({ 
      error: message || "Resource not found",
      params 
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 404 
    }
  );
}
