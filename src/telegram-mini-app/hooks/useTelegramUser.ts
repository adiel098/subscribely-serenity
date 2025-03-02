
import { useCallback, useEffect, useState } from "react";
import { TelegramUser, UseTelegramUserResult } from "@/telegram-mini-app/hooks/types/telegramTypes";
import { getWebAppData, getUserFromUrlHash, isDevelopment, getMockUser } from "@/telegram-mini-app/utils/telegramWebAppUtils";
import { getUserFromDatabase, createOrUpdateUser, mergeUserData } from "@/telegram-mini-app/services/telegramUserService";

/**
 * Custom hook to retrieve Telegram user data
 */
export const useTelegramUser = (communityId: string): UseTelegramUserResult => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  const fetchUserData = useCallback(async () => {
    try {
      console.log('🚀 Starting user data fetch process... Attempt:', fetchAttempts + 1);
      console.log('📌 Community ID:', communityId);
      console.log('📌 Current URL:', window.location.href);
      
      setLoading(true);
      setError(null);
      
      // Try to force Telegram Web App initialization if needed
      if (window.Telegram && !window.Telegram.WebApp) {
        console.log('⚠️ Telegram object exists but WebApp is not initialized. Trying to initialize...');
        try {
          // @ts-ignore - Attempting to access the Telegram object directly
          window.Telegram.WebApp = window.Telegram.WebApp || {};
        } catch (initError) {
          console.error('❌ Failed to initialize WebApp:', initError);
        }
      }
      
      // Strategy 1: Try to get data from Telegram WebApp
      console.log('🔍 Attempting to get data from Telegram WebApp...');
      let userData = getWebAppData();
      
      // Development mode handling
      const isDevMode = isDevelopment();
      
      if (userData) {
        console.log('✅ Successfully retrieved user data from Telegram WebApp:', userData);
        
        // CRITICAL: Validate that we have a proper Telegram ID format before proceeding
        // Telegram IDs are typically numbers, so they should be numeric when converted to string
        if (!userData.id) {
          console.error('❌ MISSING TELEGRAM ID');
          throw new Error('Missing Telegram user ID');
        }
        
        // More lenient ID validation - could be numeric or could be a hash in test environments
        if (isDevMode) {
          console.log('🧪 Development mode: Accepting any non-empty ID format');
        } else if (!/^\d+$/.test(userData.id)) {
          console.error('❌ INVALID TELEGRAM ID FORMAT:', userData.id);
          console.error('❌ Telegram IDs should be numeric. This looks like a UUID or another format.');
          throw new Error(`Invalid Telegram ID format: ${userData.id}`);
        }
        
        console.log('✅ Verified valid Telegram ID format:', userData.id);
        
        // If we have valid user data with proper ID, fetch additional data from database
        const dbUser = await getUserFromDatabase(userData.id);
        
        if (dbUser) {
          console.log('✅ User found in database:', dbUser);
          // Merge data from db with data from Telegram
          userData = mergeUserData(userData, dbUser);
          console.log('✅ Merged user data with database info:', userData);
        } else {
          console.log('⚠️ User not found in database, will create via edge function');
          
          // If user doesn't exist in DB, create or update them via edge function
          const createdUser = await createOrUpdateUser(userData, communityId);
          
          if (createdUser) {
            console.log('✅ User created/updated via edge function:', createdUser);
            // Update with more complete data from edge function
            userData = {
              ...userData,
              ...createdUser
            };
            
            console.log('✅ Final user data after edge function:', userData);
          }
        }
        
        setUser(userData);
      } else {
        // Try to get user data from URL hash parameters
        console.log('⚠️ No data from WebApp, trying URL hash...');
        const hashUser = await getUserFromUrlHash(communityId);
        
        if (hashUser) {
          console.log('✅ Successfully retrieved user data from URL hash:', hashUser);
          
          // Validate hash user ID
          if (!hashUser.id) {
            console.error('❌ Invalid Telegram ID from hash:', hashUser.id);
            throw new Error(`Invalid Telegram ID from URL hash: ${hashUser.id}`);
          }
          
          // Try to create/update user via edge function with hash data
          const createdUser = await createOrUpdateUser(hashUser, communityId);
          
          if (createdUser) {
            console.log('✅ User created/updated from hash via edge function:', createdUser);
            userData = {
              ...hashUser,
              ...createdUser
            };
          } else {
            userData = hashUser;
          }
          
          setUser(userData);
          return;
        }
        
        // Development mode fallback
        if (isDevMode) {
          console.log('🔍 Development environment detected, using mock user data');
          const mockUser = getMockUser();
          console.log('✅ Using mock user:', mockUser);
          setUser(mockUser);
        } else {
          console.error('❌ Could not retrieve user data from Telegram WebApp or URL hash');
          throw new Error("Could not retrieve user data from any source");
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
  }, [communityId, fetchAttempts]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const refetch = useCallback(() => {
    setFetchAttempts(prev => prev + 1);
  }, []);

  return { user, loading, error, refetch };
};
