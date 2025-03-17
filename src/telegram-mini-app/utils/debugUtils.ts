
/**
 * Create a logger with a specific scope for more organized logging
 * @param scope The scope/module name for this logger
 * @returns An object with methods for different log levels
 */
export const createLogger = (scope: string) => {
  const formatMessage = (message: string) => `[${scope}] ${message}`;
  
  return {
    log: (...args: any[]) => {
      if (typeof args[0] === 'string') {
        console.log(formatMessage(args[0]), ...args.slice(1));
      } else {
        console.log(formatMessage(''), ...args);
      }
    },
    
    warn: (...args: any[]) => {
      if (typeof args[0] === 'string') {
        console.warn(formatMessage(args[0]), ...args.slice(1));
      } else {
        console.warn(formatMessage(''), ...args);
      }
    },
    
    error: (...args: any[]) => {
      if (typeof args[0] === 'string') {
        console.error(formatMessage(args[0]), ...args.slice(1));
      } else {
        console.error(formatMessage(''), ...args);
      }
    },
    
    info: (...args: any[]) => {
      if (typeof args[0] === 'string') {
        console.info(formatMessage(args[0]), ...args.slice(1));
      } else {
        console.info(formatMessage(''), ...args);
      }
    }
  };
};
