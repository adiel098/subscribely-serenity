
/**
 * Utility functions for extracting and validating Telegram Mini App data
 */

/**
 * Extract and parse Telegram Mini App initData from URL-encoded string
 * @param initDataString The URL-encoded initData string from Telegram Mini App
 * @returns Object with parsed initData properties
 */
export function extractInitData(initDataString: string): any {
  try {
    // If the string is already an object, return it
    if (typeof initDataString === 'object') {
      console.log("InitData is already an object:", initDataString);
      return initDataString;
    }
    
    // Decode the URL-encoded string
    const decodedString = decodeURIComponent(initDataString);
    console.log("Decoded initData string:", decodedString);
    
    // Split the string into key-value pairs
    const params = new URLSearchParams(decodedString);
    
    // Convert to an object
    const result: Record<string, any> = {};
    for (const [key, value] of params.entries()) {
      try {
        // Try to parse values as JSON when possible
        if (key === 'user' || key === 'chat' || key === 'chat_instance' || key === 'chat_type') {
          result[key] = JSON.parse(value);
        } else {
          result[key] = value;
        }
      } catch (err) {
        // Fall back to string value if JSON parsing fails
        result[key] = value;
      }
    }
    
    console.log("Extracted initData:", result);
    return result;
  } catch (error) {
    console.error("Error extracting initData:", error);
    return {}; // Return empty object on failure
  }
}

/**
 * Validate that initData contains required fields
 * @param data Extracted initData object
 * @returns Boolean indicating if data is valid
 */
export function validateInitData(data: any): boolean {
  // Check if data has auth_date and user fields at minimum
  return Boolean(data && data.auth_date && data.user);
}

/**
 * Get user ID from initData
 * @param data Extracted initData object
 * @returns User ID or null if not found
 */
export function getUserIdFromInitData(data: any): string | null {
  try {
    if (data && data.user && data.user.id) {
      return data.user.id.toString();
    }
    return null;
  } catch (error) {
    console.error("Error getting user ID from initData:", error);
    return null;
  }
}
