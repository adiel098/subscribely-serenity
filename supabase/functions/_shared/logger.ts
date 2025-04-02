
export function createLogger(module: string) {
  return {
    log: (message: string) => {
      console.log(`ℹ️ [${module}] ${message}`);
    },
    error: (message: string) => {
      console.error(`❌ [${module}] ${message}`);
    },
    warn: (message: string) => {
      console.warn(`⚠️ [${module}] ${message}`);
    }
  };
}
