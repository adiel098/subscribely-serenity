import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Coupon, CreateCouponData, UpdateCouponData } from "../types/coupon.types";
import { toast } from "sonner";

export const useCoupons = (entityId: string) => {
  const queryClient = useQueryClient();

  // Fetch all coupons for a community or group
  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ['coupons', entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      console.log('Fetching coupons for entity:', entityId);
      
      try {
        const { data, error } = await supabase
          .from('project_coupons')
          .select('*')
          .eq('project_id', entityId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching coupons:', error);
          throw error;
        }
        
        console.log('Fetched coupons:', data);
        return data as Coupon[];
      } catch (err) {
        console.error('Exception in fetchCoupons:', err);
        return [];
      }
    },
    enabled: !!entityId
  });

  // Create a new coupon
  const createCoupon = useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
      console.log('Creating coupon with data:', couponData);
      
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const fullCouponData = {
          ...couponData,
          project_id: entityId,
          owner_id: userData.user.id
        };
        
        const { data, error } = await supabase
          .from('project_coupons')
          .insert(fullCouponData)
          .select()
          .single();
        
        if (error) throw error;
        
        return data as Coupon;
      } catch (err) {
        console.error('Exception in createCoupon:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', entityId] });
      toast.success("Coupon created successfully");
    }
  });

  // Update an existing coupon
  const updateCoupon = useMutation({
    mutationFn: async (data: UpdateCouponData) => {
      try {
        const { error } = await supabase
          .from('project_coupons')
          .update(data)
          .eq('id', data.id);
        
        if (error) throw error;
        
        return data;
      } catch (err) {
        console.error('Exception in updateCoupon:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', entityId] });
      toast.success("Coupon updated successfully");
    }
  });

  // Delete a coupon
  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      try {
        const { error } = await supabase
          .from('project_coupons')
          .delete()
          .eq('id', couponId);
        
        if (error) throw error;
        
        return couponId;
      } catch (err) {
        console.error('Exception in deleteCoupon:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', entityId] });
      toast.success("Coupon deleted successfully");
    }
  });

  return {
    coupons,
    isLoading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon
  };
};
