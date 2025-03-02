
import { useState, useEffect, ReactNode } from "react";

interface TelegramUserProviderProps {
  children: ReactNode;
  isDevelopmentMode: boolean;
}

export const TelegramUserProvider: React.FC<TelegramUserProviderProps> = ({
  children,
  isDevelopmentMode
}) => {
  const [extractionAttempts, setExtractionAttempts] = useState<Array<{method: string, result: string | null}>>([]);
  
  // Get Telegram user ID using multiple methods for extra reliability
  const extractTelegramUserId = (): string | null => {
    const attempts: Array<{method: string, result: string | null}> = [];
    let finalUserId: string | null = null;
    
    try {
      // Method 1: Direct access with optional chaining (recommended method)
      const method1 = "Direct access with optional chaining";
      const userId1 = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
      attempts.push({ method: method1, result: userId1 || null });
      if (userId1) {
        console.log('✅ User ID extracted with method 1:', userId1);
        finalUserId = userId1;
      }
      
      // Method 2: Explicit null checks
      if (!finalUserId) {
        const method2 = "Explicit null checks";
        let userId2 = null;
        if (window.Telegram && 
            window.Telegram.WebApp && 
            window.Telegram.WebApp.initDataUnsafe && 
            window.Telegram.WebApp.initDataUnsafe.user &&
            window.Telegram.WebApp.initDataUnsafe.user.id) {
          userId2 = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
        attempts.push({ method: method2, result: userId2 });
        if (userId2) {
          console.log('✅ User ID extracted with method 2:', userId2);
          finalUserId = userId2;
        }
      }
      
      // Method 3: Parse initData as URL params (fallback method)
      if (!finalUserId && window.Telegram?.WebApp?.initData) {
        const method3 = "Parse initData as URL params";
        try {
          const initDataParams = new URLSearchParams(window.Telegram.WebApp.initData);
          const userJson = initDataParams.get('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            const userId3 = user.id.toString();
            attempts.push({ method: method3, result: userId3 });
            if (userId3) {
              console.log('✅ User ID extracted with method 3:', userId3);
              finalUserId = userId3;
            }
          } else {
            attempts.push({ method: method3, result: null });
          }
        } catch (err) {
          console.error('❌ Error with method 3:', err);
          attempts.push({ method: method3, result: null });
        }
      }
      
      // Development mode fallback
      if (!finalUserId && isDevelopmentMode) {
        const mockId = "12345678"; // Mock ID for development
        console.log('⚠️ Using mock ID for development:', mockId);
        finalUserId = mockId;
        attempts.push({ method: "Development mode fallback", result: mockId });
      }
      
      setExtractionAttempts(attempts);
      
      // Debug output - environment
      console.log('🔍 Telegram environment check:');
      console.log('  - window.Telegram exists:', !!window.Telegram);
      console.log('  - window.Telegram.WebApp exists:', !!window.Telegram?.WebApp);
      console.log('  - initDataUnsafe exists:', !!window.Telegram?.WebApp?.initDataUnsafe);
      console.log('  - user object exists:', !!window.Telegram?.WebApp?.initDataUnsafe?.user);
      
      // Print all extraction attempts
      console.log('🔍 Telegram user ID extraction attempts:', attempts);
      console.log('🔑 Final telegram user ID:', finalUserId);
      
      return finalUserId;
    } catch (err) {
      console.error('❌ Critical error extracting Telegram user ID:', err);
      attempts.push({ method: "Error in extraction process", result: null });
      setExtractionAttempts(attempts);
      
      if (isDevelopmentMode) {
        return "12345678"; // Fallback to mock ID in development
      }
      return null;
    }
  };

  const telegramUserId = extractTelegramUserId();

  // Make debug data available in the DOM for inspection
  useEffect(() => {
    if (isDevelopmentMode) {
      // @ts-ignore - Adding debug property to window
      window.__telegramDebugData = {
        telegramUserId,
        extractionAttempts,
        telegram: window.Telegram,
        webApp: window.Telegram?.WebApp,
        initDataUnsafe: window.Telegram?.WebApp?.initDataUnsafe,
        user: window.Telegram?.WebApp?.initDataUnsafe?.user,
      };
      console.log('🛠️ Debug data attached to window.__telegramDebugData');
    }
  }, [telegramUserId, extractionAttempts, isDevelopmentMode]);

  return (
    <div data-telegram-user-id={telegramUserId}>
      {children}
    </div>
  );
};
