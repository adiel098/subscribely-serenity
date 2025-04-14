import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Coupon } from "../types/coupon.types";

interface ApplyCouponParams {
  couponId: string;
  telegramUserId?: string;
  paymentId?: string;
}

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async ({ couponId, telegramUserId, paymentId }: ApplyCouponParams) => {
      // Get the coupon
      const { data: coupon, error: couponError } = await supabase
        .from('project_coupons')
        .select('*')
        .eq('id', couponId)
        .single();
      
      if (couponError) {
        console.error('Error getting coupon:', couponError);
        throw couponError;
      }
      
      // Increment the used_count
      const { error: updateError } = await supabase
        .from('project_coupons')
        .update({ used_count: (coupon.used_count || 0) + 1 })
        .eq('id', couponId);
      
      if (updateError) {
        console.error('Error updating coupon usage count:', updateError);
        throw updateError;
      }
      
      // If we have a payment ID, update the payment record with the coupon ID
      if (paymentId) {
        const { error: paymentError } = await supabase
          .from('subscription_payments')
          .update({ coupon_id: couponId })
          .eq('id', paymentId);
        
        if (paymentError) {
          console.error('Error updating payment with coupon ID:', paymentError);
          throw paymentError;
        }
      }
      
      return { success: true, coupon };
    }
  });
};
