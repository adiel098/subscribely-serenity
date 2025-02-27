
interface TelegramWebApp {
  /**
   * Opens a link in a Telegram app
   * @param url The URL to open
   */
  openTelegramLink: (url: string) => void;
  
  /**
   * Closes the WebApp and sends the data to the bot
   * @param data The data to send
   */
  close: () => void;
  
  /**
   * Opens a link in an external browser
   * @param url The URL to open
   */
  openLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};
