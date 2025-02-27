
import { useState, useEffect, useRef } from "react";
import { TelegramUser } from "../types/app.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseTelegramUserProps {
  initData?: string | null;
  startParam?: string | null;
}

export const useTelegramUser = ({ initData, startParam }: UseTelegramUserProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webAppReady, setWebAppReady] = useState(false);
  const telegramInitialized = useRef(false);
  const { toast } = useToast();

  // Check if Telegram WebApp script has loaded
  useEffect(() => {
    if (!window.Telegram?.WebApp) {
      console.log("Telegram WebApp script not found, checking if it's loading...");
      
      const checkWebAppLoaded = () => {
        if (window.Telegram?.WebApp) {
          console.log("Telegram WebApp script loaded!");
          setWebAppReady(true);
          clearInterval(checkInterval);
        }
      };
      
      checkWebAppLoaded();
      const checkInterval = setInterval(checkWebAppLoaded, 100);
      
      return () => clearInterval(checkInterval);
    } else {
      console.log("Telegram WebApp already available");
      setWebAppReady(true);
    }
  }, []);

  // Extract user data once WebApp is ready
  useEffect(() => {
    if (!webAppReady) return;
    
    const extractTelegramData = async () => {
      // Only run this once
      if (telegramInitialized.current) return;
      telegramInitialized.current = true;
      
      console.log("WebApp ready, attempting to extract Telegram data...");
      setLoading(true);
      
      try {
        // Initialize WebApp
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        console.log("WebApp info:", {
          version: window.Telegram.WebApp.version,
          platform: window.Telegram.WebApp.platform,
          colorScheme: window.Telegram.WebApp.colorScheme,
          isExpanded: window.Telegram.WebApp.isExpanded
        });
        
        // Strategy 1: Try to get data from WebApp directly
        let userData: TelegramUser | null = null;
        
        // Add a short delay to ensure WebApp is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const webAppData = window.Telegram.WebApp.initDataUnsafe;
        if (webAppData && webAppData.user) {
          console.log("Successfully got user from WebApp:", webAppData.user);
          
          userData = {
            id: String(webAppData.user.id),
            first_name: webAppData.user.first_name || "",
            last_name: webAppData.user.last_name || "",
            username: webAppData.user.username || "",
            photo_url: ""
          };
        } else {
          console.log("No user data in WebApp object, trying initData parameter");
        }
        
        // Strategy 2: Try to parse initData if provided
        if (!userData && initData && initData.length > 0) {
          try {
            console.log("Parsing initData:", initData);
            const parsedData = JSON.parse(initData);
            if (parsedData && parsedData.user && parsedData.user.id) {
              console.log("Using user data from initData:", parsedData.user);
              userData = {
                id: String(parsedData.user.id),
                first_name: parsedData.user.first_name || "",
                last_name: parsedData.user.last_name || "",
                username: parsedData.user.username || "",
                photo_url: parsedData.user.photo_url || ""
              };
            }
          } catch (e) {
            console.error("Failed to parse initData:", e);
          }
        }
        
        // Strategy 3: Use startParam to fetch user data from backend
        if (!userData && startParam) {
          console.log("Using startParam to get user data:", startParam);
          
          try {
            // Call edge function to get user data based on start parameter
            const response = await supabase.functions.invoke("get-telegram-user", {
              body: { startParam }
            });
            
            console.log("Response from get-telegram-user function:", response);
            
            if (response.data && response.data.user) {
              userData = response.data.user;
            } else if (response.error) {
              throw new Error(response.error.message || "Error fetching user data");
            }
          } catch (err) {
            console.error("Error fetching user data from startParam:", err);
            setError("Failed to retrieve user information");
          }
        }
        
        // Strategy 4: For development environment, use a mock user
        if (!userData && process.env.NODE_ENV === 'development') {
          console.log("Using mock user data for development");
          userData = {
            id: "123456789",
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            photo_url: ""
          };
        }
        
        // Final check and setting of user data
        if (userData) {
          console.log("Final user data:", userData);
          setTelegramUser(userData);
          
          // Check if email exists for this user
          if (userData.id) {
            const { data: existingUser, error } = await supabase
              .from('telegram_mini_app_users')
              .select('email')
              .eq('telegram_id', userData.id)
              .maybeSingle();
            
            if (!error && existingUser && existingUser.email) {
              // Add email to user data if available
              setTelegramUser(prev => prev ? { ...prev, email: existingUser.email } : prev);
            }
          }
        } else {
          setError("Could not retrieve Telegram user information");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not retrieve your Telegram information. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error extracting Telegram data:", error);
        setError("Failed to initialize Telegram WebApp");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize Telegram WebApp. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    extractTelegramData();
  }, [webAppReady, initData, startParam, toast]);

  return { 
    loading, 
    telegramUser, 
    error,
    setTelegramUser 
  };
};
