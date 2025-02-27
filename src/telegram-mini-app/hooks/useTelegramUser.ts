
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

/**
 * Parse initData URL parameter to extract user information
 */
const parseInitData = (initDataString: string): TelegramUser | null => {
  if (!initDataString) return null;

  try {
    console.log('🔍 Attempting to parse initData from URL parameter:', initDataString);
    
    const params = new URLSearchParams(initDataString);
    const userParam = params.get("user");
    
    if (!userParam) {
      console.log('❌ No user parameter found in initData');
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userParam));
    console.log('✅ Successfully parsed user data from initData:', user);
    
    return {
      id: user.id?.toString() || "",
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url
    };
  } catch (error) {
    console.error("❌ Error parsing initData:", error);
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
 * Custom hook to retrieve Telegram user data with multiple fallback strategies
 */
export const useTelegramUser = (communityId: string, initData?: string) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🚀 Starting user data fetch process...');
        console.log('📌 Community ID:', communityId);
        console.log('📌 Init Data available:', Boolean(initData));
        
        setLoading(true);
        setError(null);
        
        // Strategy 1: Try to get data from Telegram WebApp
        console.log('🔍 Strategy 1: Attempting to get data from Telegram WebApp...');
        let userData = getWebAppData();
        
        if (userData) {
          console.log('✅ Strategy 1 successful! User data:', userData);
        } else {
          console.log('❌ Strategy 1 failed, moving to next strategy');
        }
        
        // Strategy 2: Try to get data from initData URL parameter
        if (!userData && initData) {
          console.log('🔍 Strategy 2: Attempting to parse initData parameter...');
          userData = parseInitData(initData);
          
          if (userData) {
            console.log('✅ Strategy 2 successful! User data:', userData);
          } else {
            console.log('❌ Strategy 2 failed, moving to next strategy');
          }
        }
        
        // If we have user data from either source, fetch additional data from database
        if (userData?.id) {
          console.log('🔍 Retrieved basic user data, now fetching additional info from database...');
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
            // Strategy 3: Fallback to edge function
            console.log('🔍 Strategy 3: Creating/updating user via edge function...');
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
          
          setUser(userData);
        } else {
          // Strategy 4: Development mode fallback
          if (isDevelopment()) {
            console.log('🔍 Development environment detected, using mock user data');
            const mockUser = getMockUser();
            console.log('✅ Using mock user:', mockUser);
            setUser(mockUser);
            return;
          }
          
          // Strategy 5: Fallback - Last resort using edge function
          console.log('🔍 All direct strategies failed, falling back to edge function as last resort...');
          // This is a last resort as it's less secure than the other methods
          if (communityId && initData) {
            console.log('📌 Edge function last resort payload:', { 
              community_id: communityId,
              initData
            });
            
            const response = await supabase.functions.invoke("telegram-user-manager", {
              body: { 
                community_id: communityId,
                initData
              }
            });
            
            if (response.error) {
              console.error('❌ Edge function error:', response.error);
              throw new Error(response.error);
            }
            
            if (response.data?.user) {
              console.log('✅ Successfully retrieved user from edge function:', response.data.user);
              setUser(response.data.user);
            } else {
              console.error('❌ Edge function did not return user data');
              setError("Could not retrieve user data");
            }
          } else {
            console.error('❌ Insufficient data to identify user');
            setError("Insufficient data to identify user");
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
  }, [communityId, initData]);

  return { user, loading, error };
};
