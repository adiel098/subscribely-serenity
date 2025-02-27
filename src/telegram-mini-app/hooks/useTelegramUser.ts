
import { useEffect, useState } from "react";
import { 
  TelegramUser, 
  getWebAppData, 
  getUserFromUrlHash, 
  isDevelopment, 
  getMockUser 
} from "../utils/telegramUserUtils";
import { fetchUserFromDatabase, createOrUpdateUser } from "../services/telegramUserService";

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
          
          // If we have user data, fetch additional data from database
          if (userData.id) {
            console.log('🔍 Fetching additional info from database...');
            
            // Check if user exists in database and get additional info (like email)
            const { user: dbUser, error: dbError } = await fetchUserFromDatabase(userData.id);
            
            if (dbError) {
              console.error("❌ Error fetching user from database:", dbError);
            } else if (dbUser) {
              // Merge data from db with data from Telegram
              userData = {
                ...userData,
                email: dbUser.email || undefined
              };
              console.log('✅ Merged user data with database info:', userData);
            } else {
              console.log('⚠️ User not found in database, will create via edge function');
              
              // If user doesn't exist in DB, create or update them via edge function
              const { user: createdUser, error: createError } = await createOrUpdateUser(userData, communityId);
              
              if (createError) {
                console.error("❌ Error creating/updating user:", createError);
              } else if (createdUser) {
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
          // Check if there's initData in the URL hash (Telegram mini apps sometimes put it there)
          userData = getUserFromUrlHash();
          
          if (userData) {
            console.log('✅ Successfully got user data from URL hash:', userData);
            
            // Try to create/update user via edge function with hash data
            const { user: createdUser, error: createError } = await createOrUpdateUser(userData, communityId);
            
            if (createError) {
              console.error("❌ Error creating/updating user from hash data:", createError);
            } else if (createdUser) {
              userData = {
                ...userData,
                ...createdUser
              };
              console.log('✅ User updated with data from database:', userData);
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

export type { TelegramUser };
