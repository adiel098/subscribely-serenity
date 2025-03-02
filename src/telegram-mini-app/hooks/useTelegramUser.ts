
import { useEffect, useState } from "react";
import { TelegramUser } from "../types/telegram-user.types";
import { getWebAppData, getUserFromHashParams } from "../utils/telegram-webapp.utils";
import { isDevelopment, getMockUser } from "../utils/environment.utils";
import { fetchUserFromDatabase, createOrUpdateUser } from "../services/userDataService";

/**
 * Custom hook to retrieve Telegram user data
 */
export const useTelegramUser = (communityId: string) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🚀 Starting user data fetch process...');
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
          
          // CRITICAL FIX: Validate that we have a proper Telegram ID format before proceeding
          // Telegram IDs are typically numbers, so they should be numeric when converted to string
          if (userData.id && !/^\d+$/.test(userData.id)) {
            console.error('❌ INVALID TELEGRAM ID FORMAT:', userData.id);
            console.error('❌ Telegram IDs should be numeric. This looks like a UUID or another format.');
            userData.id = ""; // Reset ID to force detection failure and trigger fallback
          }
          
          // If we have valid user data with proper ID, fetch additional data from database
          if (userData.id) {
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
            }
            
            // If user doesn't exist in DB, create or update them via edge function
            if (!dbUser) {
              const createdUser = await createOrUpdateUser(userData, communityId);
              
              if (createdUser) {
                // Update with more complete data from edge function
                userData = {
                  ...userData,
                  ...createdUser
                };
                // CRITICAL FIX: Ensure we're maintaining the correct Telegram ID
                // We don't need to map telegram_id to id here as our TelegramUser type doesn't have telegram_id
                console.log('✅ Final user data after edge function:', userData);
              }
            }
          }
          
          setUser(userData);
        } else {
          // Try to get user data from URL hash
          userData = getUserFromHashParams();
          
          if (userData) {
            // Try to create/update user via edge function with hash data
            const createdUser = await createOrUpdateUser(userData, communityId);
            
            if (createdUser) {
              userData = {
                ...userData,
                ...createdUser
              };
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

    fetchUserData();
  }, [communityId]);

  return { user, loading, error };
};
