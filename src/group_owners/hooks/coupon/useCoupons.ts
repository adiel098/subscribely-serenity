
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Coupon, CreateCouponData, UpdateCouponData } from "../types/coupon.types";
import { toast } from "@/components/ui/use-toast";

export const useCoupons = (communityId: string) => {
  const queryClient = useQueryClient();

  // Fetch all coupons for a community
  const { data: coupons, isLoading, error, refetch } = useQuery({
    queryKey: ['coupons', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      console.log('Fetching coupons for community:', communityId);
      
      const { data, error } = await supabase
        .from('subscription_coupons')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }
      
      console.log('Fetched coupons:', data);
      return data as Coupon[];
    },
    enabled: !!communityId
  });

  // Create a new coupon
  const createCoupon = useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
      console.log('Creating coupon with data:', couponData);
      
      const { data, error } = await supabase
        .from('subscription_coupons')
        .insert(couponData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating coupon:', error);
        throw error;
      }
      
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
    }
  });

  // Update an existing coupon
  const updateCoupon = useMutation({
    mutationFn: async (couponData: UpdateCouponData) => {
      const { id, ...updateData } = couponData;
      
      console.log('Updating coupon:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('subscription_coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating coupon:', error);
        throw error;
      }
      
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
    }
  });

  // Delete a coupon - accepts string ID
  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      console.log('Deleting coupon with ID:', couponId);
      
      const { error } = await supabase
        .from('subscription_coupons')
        .delete()
        .eq('id', couponId);
      
      if (error) {
        console.error('Error deleting coupon:', error);
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
    }
  });

  return {
    coupons,
    isLoading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch
  };
};
