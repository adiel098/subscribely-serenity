
/**
 * A logger utility that centralizes and standardizes console logging
 */

export const createLogger = (namespace: string) => {
  return {
    log: (...args: any[]) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[${namespace}]`, ...args);
      }
    },
    warn: (...args: any[]) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[${namespace}]`, ...args);
      }
    },
    error: (...args: any[]) => {
      console.error(`[${namespace}]`, ...args);
    }
  };
};
