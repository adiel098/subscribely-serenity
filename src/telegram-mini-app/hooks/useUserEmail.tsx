
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "../types/app.types";
import { useToast } from "@/components/ui/use-toast";

interface UseUserEmailProps {
  telegramUser: TelegramUser | null;
  communityId?: string;
}

export const useUserEmail = ({ telegramUser, communityId }: UseUserEmailProps) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true); // Start as true to show loading initially
  const { toast } = useToast();

  useEffect(() => {
    // Check if user exists and has email in the database when telegramUser changes
    if (telegramUser?.id) {
      checkUserExistsAndEmail(telegramUser, communityId);
    } else {
      // No user data, no processing needed
      setIsProcessing(false);
    }
  }, [telegramUser, communityId]);

  const checkUserExistsAndEmail = async (user: TelegramUser, communityId?: string) => {
    if (!user.id) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Checking if Telegram user exists:', user.id);
      
      // Check if user exists in the database
      const { data: existingUser, error: fetchError } = await supabase
        .from('telegram_mini_app_users')
        .select('*')
        .eq('telegram_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking user:", fetchError);
        throw fetchError;
      }
      
      if (!existingUser) {
        // User doesn't exist, create a new user
        console.log('Creating new Telegram user in database:', user.id);
        
        const { error: createError } = await supabase
          .from('telegram_mini_app_users')
          .insert({
            telegram_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            community_id: communityId
          });
        
        if (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
        
        // New user has no email, so show the email form
        setShowEmailForm(true);
      } else {
        console.log('User exists in database:', existingUser);
        
        // Update user data if needed (e.g., new community_id, updated name)
        if (communityId && (!existingUser.community_id || existingUser.community_id !== communityId)) {
          const { error: updateError } = await supabase
            .from('telegram_mini_app_users')
            .update({ 
              community_id: communityId,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              photo_url: user.photo_url
            })
            .eq('telegram_id', user.id);
          
          if (updateError) {
            console.error("Error updating user:", updateError);
          }
        }
        
        // If user doesn't have an email, show the email collection form
        if (!existingUser.email) {
          console.log('User has no email, showing email form');
          setShowEmailForm(true);
        } else {
          console.log('User already has email:', existingUser.email);
          setShowEmailForm(false);
        }
      }
    } catch (error) {
      console.error("Error in user check process:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify user information. Please try again."
      });
      // Default to showing the form if there's an error
      setShowEmailForm(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailFormComplete = () => {
    setShowEmailForm(false);
  };

  return { showEmailForm, isProcessing, handleEmailFormComplete };
};
