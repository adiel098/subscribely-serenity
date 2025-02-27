
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "../components/LoadingScreen";
import { CommunityHeader } from "../components/CommunityHeader";
import { SubscriptionPlans } from "../components/SubscriptionPlans";
import { CommunityNotFound } from "../components/CommunityNotFound";
import { saveUserData, TelegramUserData, getUserSubscription } from "../services/userService";
import { SuccessScreen } from "../components/SuccessScreen";
import { UserDashboard } from "../components/UserDashboard";
import { Community, TelegramWebApp } from "../types";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [userData, setUserData] = useState<TelegramUserData | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const communityId = searchParams.get("communityId") || window.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
  const paymentStatus = searchParams.get("status");

  useEffect(() => {
    // Telegram WebApp initialization
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      // Extract user data from Telegram WebApp
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (telegramUser) {
        const user: TelegramUserData = {
          id: telegramUser.id.toString(),
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url
        };
        setUserData(user);
      }
    }
  }, []);

  useEffect(() => {
    // Handle payment success
    if (paymentStatus === "success") {
      setPaymentSuccess(true);
    }
  }, [paymentStatus]);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      if (!communityId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch community details
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("*")
          .eq("id", communityId)
          .maybeSingle();

        if (communityError) {
          console.error("Error fetching community:", communityError);
          setLoading(false);
          return;
        }

        if (!communityData) {
          console.log("Community not found for ID:", communityId);
          setLoading(false);
          return;
        }

        setCommunity(communityData);
        
        // Save user data if available
        if (userData && communityData) {
          await saveUserData(userData, communityData.id);
          
          // Check if user has an active subscription
          if (userData.id) {
            const userSubscription = await getUserSubscription(userData.id, communityData.id);
            setSubscription(userSubscription);
          }
        }
      } catch (error) {
        console.error("Error in fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData || communityId) {
      fetchCommunityDetails();
    }
  }, [communityId, userData]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (paymentSuccess) {
    return <SuccessScreen communityName={community?.name} />;
  }

  if (!community) {
    return <CommunityNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CommunityHeader community={community} />
      
      {subscription?.subscription_status ? (
        <UserDashboard subscription={subscription} userData={userData} community={community} />
      ) : (
        <SubscriptionPlans communityId={community.id} userId={userData?.id} />
      )}
    </div>
  );
};

export default TelegramMiniApp;
