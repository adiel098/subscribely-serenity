
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "../hooks/onboarding/types";

export const fetchOnboardingProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_completed, onboarding_step')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw profileError;
  }

  return profile;
};

export const fetchCommunities = async (userId: string) => {
  const { data: communities, error: communitiesError } = await supabase
    .from('communities')
    .select('id, telegram_chat_id')
    .eq('owner_id', userId);

  if (communitiesError) {
    console.error("Error fetching communities:", communitiesError);
    throw communitiesError;
  }

  return communities;
};

export const fetchPlatformSubscription = async (userId: string) => {
  const { data: subscription, error: subscriptionError } = await supabase
    .from('platform_subscriptions')
    .select('id')
    .eq('owner_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (subscriptionError) {
    console.error("Error fetching subscription:", subscriptionError);
    throw subscriptionError;
  }

  return subscription;
};

export const fetchPaymentMethods = async (userId: string) => {
  const { data: paymentMethods, error: paymentMethodsError } = await supabase
    .from('payment_methods')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (paymentMethodsError) {
    console.error("Error fetching payment methods:", paymentMethodsError);
    throw paymentMethodsError;
  }

  return paymentMethods;
};

export const saveOnboardingStep = async (userId: string, step: OnboardingStep) => {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_step: step })
    .eq('id', userId);

  if (error) {
    console.error("Error saving step:", error);
    throw error;
  }
};

export const completeOnboardingProcess = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      onboarding_completed: true,
      onboarding_step: "complete"
    })
    .eq('id', userId);

  if (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
};
