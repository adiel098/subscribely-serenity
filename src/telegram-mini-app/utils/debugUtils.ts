
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
  const timestamp = () => new Date().toISOString().substring(11, 23);
  
  return {
    log: (message: string, ...args: any[]) => {
      console.log(`[${timestamp()}] [${componentName}] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`❌ [${timestamp()}] [${componentName}] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`⚠️ [${timestamp()}] [${componentName}] ${message}`, ...args);
    },
    info: (message: string, ...args: any[]) => {
      console.info(`ℹ️ [${timestamp()}] [${componentName}] ${message}`, ...args);
    },
    success: (message: string, ...args: any[]) => {
      console.log(`✅ [${timestamp()}] [${componentName}] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔧 [${timestamp()}] [${componentName}] ${message}`, ...args);
      }
    },
    group: (label: string) => {
      console.group(`🔍 [${timestamp()}] [${componentName}] ${label}`);
    },
    groupEnd: () => {
      console.groupEnd();
    },
    time: (label: string) => {
      console.time(`[${componentName}] ${label}`);
    },
    timeEnd: (label: string) => {
      console.timeEnd(`[${componentName}] ${label}`);
    },
    table: (data: any) => {
      console.group(`🔍 [${timestamp()}] [${componentName}] Table Data`);
      console.table(data);
      console.groupEnd();
    }
  };
};

/**
 * Function to log actions related to custom links
 */
export const logCustomLinkAction = (
  action: string,
  entityType: 'community' | 'group',
  idOrLink: string,
  result?: any
) => {
  console.group(`🔗 Custom Link Action: ${action}`);
  console.log(`Entity Type: ${entityType}`);
  console.log(`ID or Link: ${idOrLink}`);
  
  if (result) {
    if (result.error) {
      console.error('Error:', result.error);
    } else {
      console.log('Result:', result);
    }
  }
  
  console.groupEnd();
};

/**
 * Utility to inspect the structure of an object
 * Helps debug data shape issues
 */
export const inspectObject = (obj: any, label: string = 'Object Inspection'): void => {
  console.group(`🔍 ${label}`);
  
  if (obj === null) {
    console.log('Object is null');
  } else if (obj === undefined) {
    console.log('Object is undefined');
  } else if (typeof obj !== 'object') {
    console.log(`Not an object but a ${typeof obj}:`, obj);
  } else {
    console.log('Type:', Array.isArray(obj) ? 'Array' : 'Object');
    console.log('Keys:', Object.keys(obj));
    
    if (Array.isArray(obj)) {
      console.log('Length:', obj.length);
      if (obj.length > 0) {
        console.log('First item type:', typeof obj[0]);
        
        if (typeof obj[0] === 'object' && obj[0] !== null) {
          console.log('First item keys:', Object.keys(obj[0]));
          console.log('First item sample:', obj[0]);
        } else {
          console.log('First item value:', obj[0]);
        }
      }
    }
    
    try {
      console.log('Stringified (truncated):', JSON.stringify(obj).substring(0, 500) + (JSON.stringify(obj).length > 500 ? '...' : ''));
    } catch (e) {
      console.log('Could not stringify object:', e);
    }
  }
  
  console.groupEnd();
};
