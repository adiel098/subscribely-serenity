
/**
 * Debug utilities for helping identify issues in the application
 */

/**
 * Logs Supabase query results with detailed information
 * 
 * @param source The component or hook making the query
 * @param query The name of the query being executed
 * @param result The result object from supabase
 * @param params Any parameters used in the query
 */
export const logQueryResult = (
  source: string,
  query: string,
  result: { data: any | null, error: any | null },
  params?: Record<string, any>
) => {
  const { data, error } = result;
  
  console.group(`🔍 [${source}] Supabase Query: ${query}`);
  
  if (params) {
    console.log('Parameters:', params);
  }
  
  if (error) {
    console.error('Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
  } else {
    console.log('Success! Data received:', data ? `${Array.isArray(data) ? data.length : 1} records` : 'No data');
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('Sample data (first record):', data[0]);
    } else if (data && !Array.isArray(data)) {
      console.log('Data:', data);
    }
  }
  
  console.groupEnd();
};

/**
 * Enhanced console logging with component context
 */
export const createLogger = (componentName: string) => {
  return {
    log: (message: string, ...args: any[]) => {
      console.log(`[${componentName}] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`❌ [${componentName}] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`⚠️ [${componentName}] ${message}`, ...args);
    },
    info: (message: string, ...args: any[]) => {
      console.info(`ℹ️ [${componentName}] ${message}`, ...args);
    },
    success: (message: string, ...args: any[]) => {
      console.log(`✅ [${componentName}] ${message}`, ...args);
    }
  };
};
