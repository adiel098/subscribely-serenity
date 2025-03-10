
/**
 * Logger utility with standardized formatting
 */
export const logger = {
  log: (message: string, data?: any) => {
    console.log(`📝 ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  info: (message: string, data?: any) => {
    console.log(`ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  success: (message: string, data?: any) => {
    console.log(`✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error ? (error.message || JSON.stringify(error)) : '');
    if (error?.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  debug: (message: string, data?: any) => {
    console.log(`🔍 DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};
