
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionForm } from "@/telegram-mini-app/components/EmailCollectionForm";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();

  // Get parameters from URL
  const initData = searchParams.get("initData");
  const startParam = searchParams.get("start");
  
  console.log('💫 TelegramMiniApp initialized with:');
  console.log('📌 initData:', initData);
  console.log('📌 startParam:', startParam);
  
  // Log Telegram WebApp object if available
  if (window.Telegram?.WebApp) {
    console.log('📱 Telegram WebApp object is available:');
    console.log('📌 Full WebApp object:', window.Telegram.WebApp);
    console.log('📌 initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
    if (window.Telegram.WebApp.initDataUnsafe?.user) {
      console.log('👤 User from WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
    }
  } else {
    console.log('❌ Telegram WebApp object is NOT available');
  }

  // Use our custom hooks to retrieve data
  const { loading: communityLoading, community } = useCommunityData(startParam);
  const { user: telegramUser, loading: userLoading, error: userError } = 
    useTelegramUser(startParam || "", initData || undefined);
    
  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User error:', userError);

  // Check if user needs email collection when user data is loaded
  useEffect(() => {
    if (!userLoading && telegramUser) {
      console.log('✅ User data loaded, checking if email collection needed');
      // If user doesn't have an email, show the email collection form
      const needsEmail = !telegramUser.email;
      console.log('📧 User has email:', Boolean(telegramUser.email));
      console.log('📧 Need to collect email:', needsEmail);
      setShowEmailForm(needsEmail);
    }
  }, [telegramUser, userLoading]);

  // Handle errors from user data fetching
  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      toast({
        variant: "destructive",
        title: "User Data Error",
        description: "There was a problem retrieving your information. Some features may be limited."
      });
    }
  }, [userError, toast]);

  const handleEmailFormComplete = () => {
    console.log('📧 Email form completed');
    setShowEmailForm(false);
  };

  // Show loading screen while fetching data
  if (communityLoading || userLoading) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  // Show error if community not found
  if (!community) {
    console.log('❌ Community not found');
    return <CommunityNotFound />;
  }

  // Show email collection form if needed
  if (showEmailForm && telegramUser) {
    console.log('📝 Showing email collection form for user ID:', telegramUser.id);
    return <EmailCollectionForm telegramUserId={telegramUser.id} onComplete={handleEmailFormComplete} />;
  }

  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username 
  });
  return <MainContent community={community} telegramUser={telegramUser} />;
};

export default TelegramMiniApp;
