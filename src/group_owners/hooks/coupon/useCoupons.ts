
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Coupon, CreateCouponData, UpdateCouponData } from "../types/coupon.types";
import { toast } from "sonner";

export const useCoupons = (communityId: string) => {
  const queryClient = useQueryClient();

  // Fetch all coupons for a community
  const { data: coupons, isLoading, error, refetch } = useQuery({
    queryKey: ['coupons', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const { data, error } = await supabase
        .from('subscription_coupons')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }
      
      return data as Coupon[];
    },
    enabled: !!communityId
  });

  // Create a new coupon
  const createCoupon = useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
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
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
    },
    onError: (error) => {
      toast.error(`Failed to create coupon: ${error.message}`);
    }
  });

  // Update an existing coupon
  const updateCoupon = useMutation({
    mutationFn: async (couponData: UpdateCouponData) => {
      const { id, ...updateData } = couponData;
      
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
      toast.success('Coupon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
    },
    onError: (error) => {
      toast.error(`Failed to update coupon: ${error.message}`);
    }
  });

  // Delete a coupon - Fixed to accept string ID instead of Coupon object
  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
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
      toast.success('Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
    },
    onError: (error) => {
      toast.error(`Failed to delete coupon: ${error.message}`);
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
