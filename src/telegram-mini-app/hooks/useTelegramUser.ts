
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TelegramMiniAppUser } from "@/telegram-mini-app/types/database.types";

export interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
}

/**
 * Extract Telegram Web App data from window.Telegram
 */
const getWebAppData = (): TelegramUser | null => {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      return {
        id: user.id?.toString() || "",
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
        // Note: photo_url is not available in WebApp data
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting WebApp data:", error);
    return null;
  }
};

/**
 * Parse initData URL parameter to extract user information
 */
const parseInitData = (initDataString: string): TelegramUser | null => {
  if (!initDataString) return null;

  try {
    const params = new URLSearchParams(initDataString);
    const userParam = params.get("user");
    
    if (!userParam) return null;
    
    const user = JSON.parse(decodeURIComponent(userParam));
    return {
      id: user.id?.toString() || "",
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url
    };
  } catch (error) {
    console.error("Error parsing initData:", error);
    return null;
  }
};

/**
 * Custom hook to retrieve Telegram user data with multiple fallback strategies
 */
export const useTelegramUser = (communityId: string, initData?: string) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Strategy 1: Try to get data from Telegram WebApp
        let userData = getWebAppData();
        
        // Strategy 2: Try to get data from initData URL parameter
        if (!userData && initData) {
          userData = parseInitData(initData);
        }
        
        // If we have user data from either source, fetch additional data from database
        if (userData?.id) {
          // Check if user exists in database and get additional info (like email)
          const { data: dbUser, error: dbError } = await supabase
            .from('telegram_mini_app_users')
            .select('*')
            .eq('telegram_id', userData.id)
            .maybeSingle();
          
          if (dbError) {
            console.error("Error fetching user from database:", dbError);
          } else if (dbUser) {
            // Merge data from db with data from Telegram
            userData = {
              ...userData,
              email: dbUser.email || undefined
            };
          }
          
          // If user doesn't exist in DB, create or update them via edge function
          if (!dbUser) {
            // Strategy 3: Fallback to edge function
            const response = await supabase.functions.invoke("telegram-user-manager", {
              body: { 
                telegram_id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                photo_url: userData.photo_url,
                community_id: communityId
              }
            });
            
            if (response.error) {
              console.error("Error from edge function:", response.error);
            } else if (response.data?.user) {
              // Update with more complete data from edge function
              userData = {
                ...userData,
                ...response.data.user
              };
            }
          }
          
          setUser(userData);
        } else {
          // Strategy 3: Fallback - If all else fails, use edge function to get/create user
          // This is a last resort as it's less secure than the other methods
          if (communityId && initData) {
            const response = await supabase.functions.invoke("telegram-user-manager", {
              body: { 
                community_id: communityId,
                initData
              }
            });
            
            if (response.error) {
              throw new Error(response.error);
            }
            
            if (response.data?.user) {
              setUser(response.data.user);
            } else {
              setError("Could not retrieve user data");
            }
          } else {
            setError("Insufficient data to identify user");
          }
        }
      } catch (err) {
        console.error("Error in useTelegramUser:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [communityId, initData]);

  return { user, loading, error };
};
