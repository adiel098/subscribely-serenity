
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Community, TelegramUser } from "../types/app.types";

interface UseCommunityDataProps {
  startParam: string | null;
  initData: string | null;
  userDataParam: string | null;
}

export const useCommunityData = ({ startParam, initData, userDataParam }: UseCommunityDataProps) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // First, try to get user data from URL parameter
        let userDataFromParams = null;
        if (userDataParam) {
          try {
            const decodedUserData = decodeURIComponent(userDataParam);
            console.log('Decoded user data from URL:', decodedUserData);
            userDataFromParams = JSON.parse(decodedUserData);
            console.log('Parsed user data from URL:', userDataFromParams);
          } catch (e) {
            console.error('Failed to parse user data from URL:', e);
          }
        }
        
        // If URL parameter failed, check if we have access to Telegram WebApp data
        const webAppData = window.Telegram?.WebApp?.initDataUnsafe;
        let telegramInitData = initData || '';
        let userDataFromWebApp = null;
        
        // Debug logging
        console.log('WebApp data available:', !!webAppData);
        if (webAppData) {
          console.log('WebApp data:', JSON.stringify(webAppData, null, 2));
        }
        
        // Extract user data from WebApp if available
        if (webAppData && webAppData.user) {
          console.log('Found Telegram WebApp user data:', webAppData.user);
          userDataFromWebApp = {
            id: String(webAppData.user.id), // Convert to string to match our expected format
            first_name: webAppData.user.first_name || "",
            last_name: webAppData.user.last_name || "",
            username: webAppData.user.username || "",
            photo_url: ""  // WebApp doesn't provide photo_url directly
          };
        } else {
          console.log('No WebApp user data available, will try using initData parameter');
          
          // Attempt to extract user data from initData if it's not empty
          if (telegramInitData && telegramInitData.length > 0) {
            try {
              const parsedData = JSON.parse(telegramInitData);
              if (parsedData && parsedData.user) {
                console.log('Parsed user data from initData:', parsedData.user);
                userDataFromWebApp = {
                  id: String(parsedData.user.id),
                  first_name: parsedData.user.first_name || "",
                  last_name: parsedData.user.last_name || "",
                  username: parsedData.user.username || "",
                  photo_url: parsedData.user.photo_url || ""
                };
              }
            } catch (e) {
              console.error('Failed to parse initData:', e);
            }
          }
        }
        
        // Prioritize different user data sources
        let finalUserData = userDataFromParams || userDataFromWebApp;
        
        // If we're in development environment and no user data is available, use a mock user
        if (!finalUserData && process.env.NODE_ENV === 'development') {
          console.log('Using mock user data for development');
          finalUserData = {
            id: "123456789",
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            photo_url: ""
          };
        }
        
        console.log('Fetching community data with params:', { 
          startParam, 
          initDataLength: telegramInitData.length,
          userDataFromParams: userDataFromParams ? 'Present' : 'Not available',
          userDataFromWebApp: userDataFromWebApp ? 'Present' : 'Not available',
          finalUserData: finalUserData ? 'Present' : 'Not available'
        });
        
        // Make sure there's data to send
        if (!startParam) {
          console.error("No start parameter provided");
          setError("Missing community ID");
          setLoading(false);
          return;
        }
        
        // Prepare payload for the Edge Function
        const payload = { 
          start: startParam,
          initData: telegramInitData,
          webAppUser: finalUserData  // Pass final user data
        };
        
        console.log('Sending payload to telegram-mini-app function:', payload);
        
        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: payload
        });

        console.log('Full response from telegram-mini-app function:', response);

        if (response.error) {
          console.error("Error from function:", response.error);
          setError(response.error.message || "Error fetching community data");
          throw new Error(response.error.message || "Error fetching community data");
        }

        if (response.data?.community) {
          console.log("Community data received:", response.data.community);
          setCommunity(response.data.community);
          
          // Extract user data if available
          if (response.data.user) {
            const userData = response.data.user;
            console.log("User data from function:", userData);
            
            if (userData && userData.id) {
              setTelegramUser({
                id: userData.id,
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                username: userData.username || "",
                photo_url: userData.photo_url || "",
                email: userData.email
              });
            } else {
              console.warn("User data missing required fields:", userData);
            }
          } else if (finalUserData) {
            // If we have user data from params or WebApp but not from response, use it
            console.log("Using final user data:", finalUserData);
            setTelegramUser(finalUserData);
          } else {
            console.warn("No user data available from any source");
            // We still want to proceed even without user data
            // This allows the app to work in non-Telegram environments for testing
          }
        } else {
          console.error("No community data returned from function");
          setError("Community not found");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
        setError("Failed to load data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load community data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [startParam, initData, userDataParam, toast]);

  return { loading, community, telegramUser, error, setTelegramUser };
};
