
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";
import { toast } from "@/components/ui/use-toast";

interface UsePaymentProcessingOptions {
  communityId: string;
  planId: string;
  communityInviteLink: string | null;
  telegramUserId?: string;
  onSuccess?: () => void;
}

export const usePaymentProcessing = ({
  communityId,
  planId,
  communityInviteLink,
  telegramUserId,
  onSuccess
}: UsePaymentProcessingOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(communityInviteLink);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('🔍 usePaymentProcessing INITIAL STATE:');
    console.log('📤 Community ID:', communityId);
    console.log('📤 Plan ID:', planId);
    console.log('📤 Initial Invite Link:', communityInviteLink);
    console.log('📤 Telegram User ID:', telegramUserId);
  }, [communityId, planId, communityInviteLink, telegramUserId]);

  // Log invite link changes for debugging
  useEffect(() => {
    console.log('🔗 Invite link updated:', inviteLink);
  }, [inviteLink]);

  // Fetch invite link from edge function
  const fetchInviteLinkFromEdgeFunction = async () => {
    console.log('🔄 Attempting to fetch invite link from edge function...');
    try {
      const response = await supabase.functions.invoke("telegram-community-data", {
        body: { 
          community_id: communityId, 
          debug: true,
          operation: "get_invite_link"
        }
      });
      
      console.log('📥 Edge function response:', response);
      
      if (response.data?.invite_link) {
        console.log('✅ Retrieved invite link from edge function:', response.data.invite_link);
        return response.data.invite_link;
      } else if (response.data?.community?.telegram_invite_link) {
        console.log('✅ Retrieved invite link from community data:', response.data.community.telegram_invite_link);
        return response.data.community.telegram_invite_link;
      } else {
        console.warn('⚠️ No invite link in edge function response');
        return null;
      }
    } catch (err) {
      console.error("❌ Error fetching invite link from edge function:", err);
      return null;
    }
  };

  // Fetch invite link from database
  const fetchInviteLinkFromDatabase = async () => {
    console.log('🔄 Attempting to fetch invite link from database...');
    try {
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('telegram_invite_link')
        .eq('id', communityId)
        .single();
        
      if (communityError) {
        console.error('❌ Error fetching community:', communityError);
        return null;
      } else if (communityData?.telegram_invite_link) {
        console.log('✅ Retrieved invite link from database:', communityData.telegram_invite_link);
        return communityData.telegram_invite_link;
      } else {
        console.warn('⚠️ No invite link found in database');
        return null;
      }
    } catch (err) {
      console.error("❌ Error in fetchInviteLinkFromDatabase:", err);
      return null;
    }
  };

  const processPayment = async (paymentMethod: string) => {
    if (!telegramUserId) {
      setError("User ID not found. Please try again later.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Processing payment:');
      console.log('📤 Payment Method:', paymentMethod);
      console.log('📤 Community ID:', communityId);
      console.log('📤 Plan ID:', planId);
      console.log('📤 Telegram User ID:', telegramUserId);
      console.log('📤 Current Invite Link:', inviteLink);
      
      // Generate a demo payment ID
      const paymentId = `demo-${Date.now()}`;
      
      // First, try to get the community invite link if it's not already available
      let currentInviteLink = inviteLink;
      
      if (!currentInviteLink) {
        console.log('⚠️ No invite link available. Attempting to fetch from multiple sources...');
        
        // Try database first
        currentInviteLink = await fetchInviteLinkFromDatabase();
        
        // If still no link, try the edge function
        if (!currentInviteLink) {
          currentInviteLink = await fetchInviteLinkFromEdgeFunction();
        }
        
        // Update state if we found a link
        if (currentInviteLink) {
          console.log('✅ Successfully retrieved invite link:', currentInviteLink);
          setInviteLink(currentInviteLink);
        } else {
          console.warn('⚠️ Still no invite link after checking all sources');
        }
      }
      
      // Log the payment to the database with the current invite link
      console.log('📝 Recording payment with invite link:', currentInviteLink);
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          plan_id: planId,
          payment_method: paymentMethod,
          amount: 0, // This would be the actual amount in a real implementation
          status: 'successful',
          invite_link: currentInviteLink
        })
        .select()
        .single();

      if (paymentError) {
        console.error("❌ Error recording payment:", paymentError);
        throw new Error(`Payment recording failed: ${paymentError.message}`);
      }

      console.log('✅ Payment recorded successfully:', paymentData);
      
      // If we got the invite link from the payment response, use it
      if (paymentData?.invite_link && !currentInviteLink) {
        console.log('✅ Got invite link from payment record:', paymentData.invite_link);
        currentInviteLink = paymentData.invite_link;
        setInviteLink(currentInviteLink);
      }

      // Update or create member status
      console.log('📝 Updating member status...');
      const success = await createOrUpdateMember({
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentId
      });

      if (!success) {
        console.error('❌ Failed to update membership status');
        throw new Error("Failed to update membership status");
      }
      
      console.log('✅ Member status updated successfully');

      // Final check and attempt for invite link if still not available
      if (!currentInviteLink) {
        console.warn("⚠️ Payment successful but still no invite link available!");
        console.log('🔄 Making final attempt to create a new invite link...');
        
        try {
          // Try to create a new invite link
          const response = await supabase.functions.invoke("create-invite-link", {
            body: { community_id: communityId }
          });
          
          console.log('📥 Create invite link response:', response);
          
          if (response.data?.invite_link) {
            console.log('✅ Created new invite link:', response.data.invite_link);
            currentInviteLink = response.data.invite_link;
            setInviteLink(currentInviteLink);
            
            // Update the payment record with the new link
            const { error: updateError } = await supabase
              .from('subscription_payments')
              .update({ invite_link: currentInviteLink })
              .eq('id', paymentData.id);
              
            if (updateError) {
              console.error('❌ Error updating payment with new invite link:', updateError);
            }
          } else {
            console.error('❌ Failed to create new invite link');
          }
        } catch (err) {
          console.error("❌ Error creating new invite link:", err);
        }
      }

      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: currentInviteLink 
          ? "Thank you for your payment. You can now join the community." 
          : "Payment successful, but no invite link is available. Please contact support.",
      });
      
      console.log('✅ Payment process completed successfully');
      console.log('📤 Final invite link:', currentInviteLink);
      
      onSuccess?.();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      console.error("❌ Payment processing error:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  };

  return {
    processPayment,
    isLoading,
    error,
    isSuccess,
    inviteLink,
    resetState
  };
};
