
import { supabase } from "@/integrations/supabase/client";
import { PaymentData } from "../types/payment.types";

export const createPayment = async (paymentData: PaymentData) => {
  const { data: payment, error: paymentError } = await supabase
    .from('subscription_payments')
    .insert([paymentData])
    .select()
    .single();

  if (paymentError) {
    throw paymentError;
  }

  return payment;
};

export const createInviteLink = async (communityId: string) => {
  const { data, error } = await supabase.functions.invoke(
    'create-invite-link',
    {
      body: { communityId },
    }
  );

  if (error) {
    throw error;
  }

  return data?.inviteLink;
};

