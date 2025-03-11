
// Logger utility for the telegram-community-data function

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

class Logger {
  private level: LogLevel = LogLevel.DEBUG;

  constructor(level?: LogLevel) {
    if (level !== undefined) {
      this.level = level;
    }
  }

  debug(message: string, data?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, data !== undefined ? data : '');
    }
  }

  info(message: string, data?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, data !== undefined ? data : '');
    }
  }

  success(message: string, data?: any): void {
    if (this.level <= LogLevel.SUCCESS) {
      console.log(`[SUCCESS] ✅ ${message}`, data !== undefined ? data : '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ⚠️ ${message}`, data !== undefined ? data : '');
    }
  }

  error(message: string, data?: any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ❌ ${message}`, data !== undefined ? data : '');
    }
  }
}

export const logger = new Logger();
