
import { useEffect, useState } from "react";
import { TelegramUser, TelegramUserHookResult } from "@/telegram-mini-app/types/telegramTypes";
import { getWebAppData } from "@/telegram-mini-app/utils/webAppDataExtractor";
import { isDevelopment } from "@/telegram-mini-app/utils/telegramUtils";
import { getMockUser } from "@/telegram-mini-app/utils/mockData";
import { fetchUserFromDatabase, createOrUpdateUser } from "@/telegram-mini-app/services/telegramUserService";

/**
 * Custom hook to retrieve Telegram user data
 */
export const useTelegramUser = (communityId: string, directTelegramUserId?: string | null): TelegramUserHookResult => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      console.log('🚀 Starting user data fetch process...');
      console.log('📌 Community ID:', communityId);
      console.log('📌 Direct Telegram User ID:', directTelegramUserId);
      console.log('📌 Current URL:', window.location.href);
      
      setLoading(true);
      setError(null);
      
      // Strategy 1: Try to get data from Telegram WebApp
      console.log('🔍 Attempting to get data from Telegram WebApp...');
      let userData = getWebAppData(directTelegramUserId);
      
      // Development mode handling
      const isDevMode = isDevelopment();
      
      if (userData) {
        console.log('✅ Successfully retrieved user data from Telegram WebApp or direct ID:', userData);
        
        // If we have user data, fetch additional data from database
        if (userData.id) {
          console.log('🔍 Fetching additional info from database...');
          
          // Check if user exists in database and get additional info (like email)
          const dbUser = await fetchUserFromDatabase(userData.id);
          
          if (dbUser) {
            // Merge data from db with data from Telegram
            userData = {
              ...userData,
              email: dbUser.email || undefined,
              // If the database has a photo_url and Telegram doesn't, use the one from the database
              photo_url: userData.photo_url || dbUser.photo_url || undefined,
              // Same for username
              username: userData.username || dbUser.username || undefined
            };
            console.log('✅ Merged user data with database info:', userData);
          } else {
            console.log('⚠️ User not found in database, will create via edge function');
            
            // If user doesn't exist in DB, create or update them via edge function
            const createdUser = await createOrUpdateUser(userData, communityId);
            if (createdUser) {
              // Update with more complete data from edge function
              userData = {
                ...userData,
                ...createdUser
              };
              console.log('✅ Final user data after edge function:', userData);
            }
          }
        }
        
        setUser(userData);
      } else {
        // Development mode fallback
        if (isDevMode) {
          console.log('🔍 Development environment detected, using mock user data');
          const mockUser = getMockUser();
          console.log('✅ Using mock user:', mockUser);
          setUser(mockUser);
        } else {
          console.error('❌ Could not retrieve user data from Telegram WebApp');
          setError("Could not retrieve user data");
        }
      }
    } catch (err) {
      console.error("❌ Error in useTelegramUser:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      // If in development mode, still use mock data even if there was an error
      if (isDevelopment()) {
        console.log('🔄 Using mock data after error in development mode');
        setUser(getMockUser());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [communityId, directTelegramUserId]);

  return { 
    user, 
    loading, 
    error,
    refetch: fetchUserData
  };
};
