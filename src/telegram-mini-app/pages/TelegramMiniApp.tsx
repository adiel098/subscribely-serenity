
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

  // Use our custom hooks to retrieve data
  const { loading: communityLoading, community } = useCommunityData(startParam);
  const { user: telegramUser, loading: userLoading, error: userError } = 
    useTelegramUser(startParam || "", initData || undefined);

  // Check if user needs email collection when user data is loaded
  useEffect(() => {
    if (!userLoading && telegramUser) {
      // If user doesn't have an email, show the email collection form
      setShowEmailForm(!telegramUser.email);
    }
  }, [telegramUser, userLoading]);

  // Handle errors from user data fetching
  useEffect(() => {
    if (userError) {
      console.error("Error getting user data:", userError);
      toast({
        variant: "destructive",
        title: "User Data Error",
        description: "There was a problem retrieving your information. Some features may be limited."
      });
    }
  }, [userError, toast]);

  const handleEmailFormComplete = () => {
    setShowEmailForm(false);
  };

  // Show loading screen while fetching data
  if (communityLoading || userLoading) {
    return <LoadingScreen />;
  }

  // Show error if community not found
  if (!community) {
    return <CommunityNotFound />;
  }

  // Show email collection form if needed
  if (showEmailForm && telegramUser) {
    return <EmailCollectionForm telegramUserId={telegramUser.id} onComplete={handleEmailFormComplete} />;
  }

  return <MainContent community={community} />;
};

export default TelegramMiniApp;
