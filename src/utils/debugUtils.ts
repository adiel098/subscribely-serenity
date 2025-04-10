
/**
 * Debug utilities for logging in a structured way
 */

type LoggerLevel = 'log' | 'warn' | 'error';

export interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export function createLogger(namespace: string): Logger {
  const isDebug = process.env.NODE_ENV !== 'production';
  
  const formatMessage = (level: string, ...args: any[]) => {
    const prefix = `[${namespace}:${level}]`;
    return [prefix, ...args];
  };
  
  return {
    log: (...args: any[]) => {
      if (isDebug) console.log(...formatMessage('log', ...args));
    },
    warn: (...args: any[]) => {
      if (isDebug) console.warn(...formatMessage('warn', ...args));
    },
    error: (...args: any[]) => {
      console.error(...formatMessage('error', ...args));
    }
  };
}
