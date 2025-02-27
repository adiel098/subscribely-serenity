
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
        
        setLoading(true);
        setError(null);
        
        // Strategy 1: Try to get data from Telegram WebApp
        console.log('🔍 Attempting to get data from Telegram WebApp...');
        let userData = getWebAppData();
        
        if (userData) {
          console.log('✅ Successfully retrieved user data from Telegram WebApp:', userData);
          
          // If we have user data, fetch additional data from database
          if (userData.id) {
            console.log('🔍 Fetching additional info from database...');
            console.log('📌 Looking up user with telegram_id:', userData.id);
            
            // Check if user exists in database and get additional info (like email)
            const { data: dbUser, error: dbError } = await supabase
              .from('telegram_mini_app_users')
              .select('*')
              .eq('telegram_id', userData.id)
              .maybeSingle();
            
            if (dbError) {
              console.error("❌ Error fetching user from database:", dbError);
            } else if (dbUser) {
              console.log('✅ User found in database:', dbUser);
              // Merge data from db with data from Telegram
              userData = {
                ...userData,
                email: dbUser.email || undefined
              };
              console.log('✅ Merged user data with database info:', userData);
            } else {
              console.log('⚠️ User not found in database, will create via edge function');
            }
            
            // If user doesn't exist in DB, create or update them via edge function
            if (!dbUser) {
              console.log('🔍 Creating/updating user via edge function...');
              console.log('📌 Edge function payload:', { 
                telegram_id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                photo_url: userData.photo_url,
                community_id: communityId
              });
              
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
                console.error("❌ Error from edge function:", response.error);
              } else if (response.data?.user) {
                console.log('✅ User created/updated via edge function:', response.data.user);
                // Update with more complete data from edge function
                userData = {
                  ...userData,
                  ...response.data.user
                };
                console.log('✅ Final user data after edge function:', userData);
              }
            }
          }
          
          setUser(userData);
        } else {
          // Development mode fallback
          if (isDevelopment()) {
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
      } finally {
        console.log('🏁 User data fetch process completed. User:', user);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [communityId]);

  return { user, loading, error };
};
