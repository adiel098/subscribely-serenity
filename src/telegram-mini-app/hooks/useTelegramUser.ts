
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
      
      // CRITICAL FIX: Ensure we're extracting the actual Telegram ID
      // The Telegram user ID comes as a number in the API response but we need to store as string
      // Make sure we're using the ID directly from the user object
      const telegramId = user.id?.toString() || "";
      console.log('🔑 Raw Telegram ID from WebApp:', user.id);
      console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
      
      // In recent Telegram WebApp versions, photo_url might be available directly
      // We explicitly check for its presence as a property
      const photoUrl = user.photo_url || undefined;
      console.log('📸 Photo URL from WebApp data:', photoUrl);
      
      return {
        id: telegramId,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: photoUrl
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
          
          // CRITICAL FIX: Ensure we're extracting the actual Telegram ID
          // Make sure we're using the ID directly from the parsed user object
          const telegramId = user.id?.toString() || "";
          console.log('🔑 Raw Telegram ID from parsed initData:', user.id);
          console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
          
          return {
            id: telegramId,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url
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
              console.log('🔍 Creating/updating user via edge function...');
              const payload = { 
                telegram_id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                photo_url: userData.photo_url,
                community_id: communityId
              };
              
              console.log('📌 Edge function payload:', payload);
              
              try {
                const response = await supabase.functions.invoke("telegram-user-manager", {
                  body: payload
                });
                
                console.log('📊 Edge function response:', response);
                
                if (response.error) {
                  console.error("❌ Error from edge function:", response.error);
                } else if (response.data?.user) {
                  console.log('✅ User created/updated via edge function:', response.data.user);
                  // Update with more complete data from edge function
                  userData = {
                    ...userData,
                    ...response.data.user
                  };
                  
                  // Restore the correct original line - this is what we're reverting back to
                  userData.id = userData.id;
                  
                  console.log('✅ Final user data after edge function:', userData);
                }
              } catch (edgeFunctionError) {
                console.error("❌ Exception when calling edge function:", edgeFunctionError);
              }
            }
          }
          
          setUser(userData);
        } else {
          // Check if there's initData in the URL hash (Telegram mini apps sometimes put it there)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const initData = hashParams.get('tgWebAppData');
          
          if (initData) {
            console.log('🔍 Found initData in URL hash:', initData);
            try {
              const data = new URLSearchParams(initData);
              const userStr = data.get('user');
              if (userStr) {
                const parsedUser = JSON.parse(userStr);
                console.log('✅ Successfully parsed user data from hash:', parsedUser);
                
                // CRITICAL FIX: Extract the actual Telegram ID
                // Always ensure the ID is a string
                const telegramId = parsedUser.id?.toString() || "";
                console.log('🔑 Raw Telegram ID from hash:', parsedUser.id);
                console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
                
                // CRITICAL FIX: Validate ID format
                if (telegramId && !/^\d+$/.test(telegramId)) {
                  console.error('❌ INVALID TELEGRAM ID FORMAT FROM HASH:', telegramId);
                  throw new Error('Invalid Telegram ID format');
                }
                
                userData = {
                  id: telegramId,
                  first_name: parsedUser.first_name,
                  last_name: parsedUser.last_name,
                  username: parsedUser.username,
                  photo_url: parsedUser.photo_url
                };
                
                // Try to create/update user via edge function with hash data
                try {
                  console.log('🔍 Creating/updating user from hash data via edge function...');
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
                    console.error("❌ Error from edge function with hash data:", response.error);
                  } else if (response.data?.user) {
                    console.log('✅ User created/updated from hash via edge function:', response.data.user);
                    userData = {
                      ...userData,
                      ...response.data.user
                    };
                    
                    // Restore the correct original line - this is what we're reverting back to
                    userData.id = userData.id;
                  }
                } catch (hashEdgeFunctionError) {
                  console.error("❌ Exception when calling edge function with hash data:", hashEdgeFunctionError);
                }
                
                setUser(userData);
                return;
              }
            } catch (parseError) {
              console.error('❌ Error parsing initData from hash:', parseError);
            }
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
