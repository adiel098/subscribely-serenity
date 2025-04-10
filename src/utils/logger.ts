
/**
 * A simple logger utility for consistent logging
 */

const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${new Date().toISOString()} info: ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`${new Date().toISOString()} warn: ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`${new Date().toISOString()} error: ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`${new Date().toISOString()} debug: ${message}`, ...args);
    }
  }
};

export default logger;
