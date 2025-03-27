
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
      
      try {
        const { data, error } = await supabase
          .from('subscription_coupons')
          .select('*')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching coupons:', error);
          if (error.message?.includes('infinite recursion')) {
            // Use RPC function to check auth status if hitting recursion issues
            toast({
              title: "Database permission issue",
              description: "There's a permission issue with your account. Please contact support.",
              variant: "destructive"
            });
          }
          throw error;
        }
        
        console.log('Fetched coupons:', data);
        return data as Coupon[];
      } catch (err) {
        console.error('Exception in fetchCoupons:', err);
        // Return empty array to prevent UI from breaking
        return [];
      }
    },
    enabled: !!communityId
  });

  // Create a new coupon
  const createCoupon = useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
      console.log('Creating coupon with data:', couponData);
      
      try {
        // Make sure owner_id is set to the authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting current user:', userError);
          throw userError;
        }

        const fullCouponData = {
          ...couponData,
          owner_id: userData.user.id
        };
        
        console.log('Submitting coupon with full data:', fullCouponData);
        
        const { data, error } = await supabase
          .from('subscription_coupons')
          .insert(fullCouponData)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating coupon:', error);
          if (error.message?.includes('infinite recursion')) {
            toast({
              title: "Database permission issue",
              description: "There's an admin permission issue. Please use the get_admin_status function.",
              variant: "destructive"
            });
          }
          throw error;
        }
        
        console.log('Created coupon successfully:', data);
        return data as Coupon;
      } catch (err) {
        console.error('Exception in createCoupon:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error in createCoupon:', error);
      toast({
        title: "Error creating coupon",
        description: error.message || "There was an error creating the coupon. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update an existing coupon
  const updateCoupon = useMutation({
    mutationFn: async (couponData: UpdateCouponData) => {
      const { id, ...updateData } = couponData;
      
      console.log('Updating coupon:', id, 'with data:', updateData);
      
      try {
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
        
        console.log('Updated coupon successfully:', data);
        return data as Coupon;
      } catch (err) {
        console.error('Exception in updateCoupon:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error in updateCoupon:', error);
      toast({
        title: "Error updating coupon",
        description: error.message || "There was an error updating the coupon. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete a coupon - accepts string ID
  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      console.log('Deleting coupon with ID:', couponId);
      
      try {
        const { error } = await supabase
          .from('subscription_coupons')
          .delete()
          .eq('id', couponId);
        
        if (error) {
          console.error('Error deleting coupon:', error);
          throw error;
        }
        
        console.log('Deleted coupon successfully');
        return { success: true, id: couponId };
      } catch (err) {
        console.error('Exception in deleteCoupon:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', communityId] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error in deleteCoupon:', error);
      toast({
        title: "Error deleting coupon",
        description: error.message || "There was an error deleting the coupon. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    coupons: coupons || [],
    isLoading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch
  };
};
