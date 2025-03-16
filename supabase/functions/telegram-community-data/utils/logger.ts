
/**
 * Simple logging utility for edge functions
 */
export const logger = {
  debug: (message: string, data?: any) => {
    console.log(`🔍 DEBUG: ${message}`, data !== undefined ? data : '');
  },
  
  info: (message: string, data?: any) => {
    console.log(`ℹ️ INFO: ${message}`, data !== undefined ? data : '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ WARNING: ${message}`, data !== undefined ? data : '');
  },
  
  error: (message: string, data?: any) => {
    console.error(`❌ ERROR: ${message}`, data !== undefined ? data : '');
  },
  
  success: (message: string, data?: any) => {
    console.log(`✅ SUCCESS: ${message}`, data !== undefined ? data : '');
  }
};
