
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
    console.log('🔍 Attempting to get WebApp data from window.Telegram...');
    console.log('📊 window.Telegram exists:', Boolean(window.Telegram));
    console.log('📊 window.Telegram.WebApp exists:', Boolean(window.Telegram?.WebApp));
    console.log('📊 initDataUnsafe exists:', Boolean(window.Telegram?.WebApp?.initDataUnsafe));
    console.log('📊 user exists:', Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user));
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      console.log('✅ Successfully retrieved WebApp data:', user);
      
      return {
        id: user.id?.toString() || "",
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
        // Note: photo_url is not available in WebApp data
      };
    }

    // If we have initData but no user, try parsing the initData
    if (window.Telegram?.WebApp?.initData && !window.Telegram?.WebApp?.initDataUnsafe?.user) {
      console.log('🔄 Trying to manually parse initData:', window.Telegram.WebApp.initData);
      try {
        // initData is a URLEncoded string with key=value pairs
        const data = new URLSearchParams(window.Telegram.WebApp.initData);
        const userStr = data.get('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('✅ Successfully parsed user data from initData:', user);
          
          return {
            id: user.id?.toString() || "",
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username
          };
        }
      } catch (parseError) {
        console.error('❌ Error parsing initData:', parseError);
      }
    }
    
    console.log('❌ WebApp data not available in window.Telegram');
    return null;
  } catch (error) {
    console.error("❌ Error extracting WebApp data:", error);
    return null;
  }
};

// Detect if we're in development mode
const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Mock data for development/testing
const getMockUser = (): TelegramUser => {
  return {
    id: "123456789",
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
    email: "test@example.com"
  };
};

/**
 * Custom hook to retrieve Telegram user data and ensure it's saved to database
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
        
        if (!userData && isDevMode) {
          console.log('🔍 Development environment detected, using mock user data');
          userData = getMockUser();
          console.log('✅ Using mock user:', userData);
        }
        
        if (!userData) {
          console.error('❌ Could not retrieve user data from Telegram WebApp');
          setError("Could not retrieve user data");
          setLoading(false);
          return;
        }
        
        console.log('✅ Successfully retrieved user data:', userData);
          
        // If we have user data, save it to database
        if (userData.id) {
          console.log('🔍 Saving user data to database...');
          console.log('📌 User data to save:', {
            telegram_id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            photo_url: userData.photo_url,
            community_id: communityId
          });
          
          // Use upsert to create or update the user record
          const { data: savedUser, error: saveError } = await supabase
            .from('telegram_mini_app_users')
            .upsert({
              telegram_id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              photo_url: userData.photo_url,
              community_id: communityId
            }, {
              onConflict: 'telegram_id',
              returning: 'representation'
            });
            
          if (saveError) {
            console.error('❌ Error saving user to database:', saveError);
          } else {
            console.log('✅ Successfully saved user to database:', savedUser);
            
            // If the user was saved, fetch the complete record to get the email
            const { data: dbUser, error: fetchError } = await supabase
              .from('telegram_mini_app_users')
              .select('*')
              .eq('telegram_id', userData.id)
              .maybeSingle();
              
            if (fetchError) {
              console.error('❌ Error fetching saved user:', fetchError);
            } else if (dbUser) {
              console.log('✅ Retrieved complete user record:', dbUser);
              // Update with complete data from database
              userData = {
                ...userData,
                email: dbUser.email || undefined
              };
              console.log('✅ Final user data with email:', userData);
            }
          }
        }
          
        setUser(userData);
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
