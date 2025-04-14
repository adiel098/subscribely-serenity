import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCouponResult } from "../types/coupon.types";

interface CheckCouponParams {
  couponCode: string;
  projectId: string;
  planPrice: number;
}

export const useCheckCoupon = () => {
  return useMutation({
    mutationFn: async ({ couponCode, projectId, planPrice }: CheckCouponParams): Promise<CheckCouponResult> => {
      if (!couponCode) {
        return { isValid: false, message: "No coupon code provided" };
      }

      // Get the coupon by code
      const { data: coupon, error } = await supabase
        .from('project_coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { isValid: false, message: "Invalid coupon code" };
        }
        console.error('Error checking coupon:', error);
        return { isValid: false, message: "Error checking coupon" };
      }
      
      if (!coupon) {
        return { isValid: false, message: "Coupon not found" };
      }
      
      // Check if coupon is expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { isValid: false, message: "Coupon has expired", coupon };
      }
      
      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return { isValid: false, message: "Coupon usage limit reached", coupon };
      }
      
      // Calculate discount
      let discountAmount = 0;
      let finalPrice = planPrice;
      
      if (coupon.discount_type === 'percentage') {
        discountAmount = (planPrice * coupon.discount_amount) / 100;
        finalPrice = planPrice - discountAmount;
      } else if (coupon.discount_type === 'fixed') {
        discountAmount = coupon.discount_amount;
        finalPrice = Math.max(0, planPrice - discountAmount);
      }
      
      return { 
        isValid: true, 
        coupon, 
        discountAmount, 
        finalPrice,
        message: `Coupon applied: ${coupon.discount_type === 'percentage' ? `${coupon.discount_amount}% off` : `$${coupon.discount_amount} off`}`
      };
    }
  });
};
