
import { corsHeaders } from "../../cors.ts";

/**
 * Core utilities for Telegram API interactions
 */

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a base64 data URL for an image
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check if it's a URL
  try {
    new URL(url);
    return url.startsWith('https://');
  } catch (e) {
    return false;
  }
}

/**
 * Process base64 image data for Telegram API
 */
export function processBase64Image(base64Data: string, imageFormat: string = 'jpeg'): Blob {
  // Extract the base64 data
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: `image/${imageFormat}` });
}

/**
 * Format reply markup for Telegram API
 */
export function formatReplyMarkup(replyMarkup: any): string | null {
  if (!replyMarkup) return null;
  
  return typeof replyMarkup === 'string' 
    ? replyMarkup 
    : JSON.stringify(replyMarkup);
}

/**
 * Get default headers for Telegram API requests
 */
export function getApiHeaders(isFormData: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {
    ...corsHeaders
  };
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}
