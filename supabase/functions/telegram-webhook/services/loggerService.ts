
export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export function getLogger(context: string): Logger {
  return {
    info(message: string, ...args: any[]) {
      console.log(`[${context}] [INFO] ${message}`, ...args);
    },
    error(message: string, ...args: any[]) {
      console.error(`[${context}] [ERROR] ${message}`, ...args);
    },
    warn(message: string, ...args: any[]) {
      console.warn(`[${context}] [WARN] ${message}`, ...args);
    },
    debug(message: string, ...args: any[]) {
      console.debug(`[${context}] [DEBUG] ${message}`, ...args);
    }
  };
}
