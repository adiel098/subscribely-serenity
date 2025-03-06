
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser, AdminUserRole } from "./types/adminUsers.types";

type FormValues = {
  status: 'active' | 'inactive' | 'suspended';
  role: AdminUserRole;
};

export const useEditUserDialog = (
  user: AdminUser | null,
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>,
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>,
  onClose: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [activatePlanDialogOpen, setActivatePlanDialogOpen] = useState(false);
  const [platformPlans, setPlatformPlans] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    defaultValues: {
      status: user?.status || 'active',
      role: user?.role || 'user',
    }
  });
  
  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        status: user.status,
        role: user.role,
      });
    }
  }, [user, form]);

  // Fetch platform plans
  useEffect(() => {
    const fetchPlatformPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_plans')
          .select('id, name')
          .eq('is_active', true);
        
        if (error) throw error;
        setPlatformPlans(data || []);
      } catch (error) {
        console.error("Error fetching platform plans:", error);
      }
    };

    fetchPlatformPlans();
  }, []);
  
  // Watch for status changes and handle form submission
  const watchedStatus = form.watch('status');
  
  // This function will be called when the form is submitted
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    // If status is changing from inactive/suspended to active, open the plan dialog
    const isChangingToActive = data.status === 'active' && 
                              (user.status === 'inactive' || user.status === 'suspended');
    
    console.log("Status changing:", {
      originalStatus: user.status,
      newStatus: data.status,
      isChangingToActive,
      hasPlatformPlans: platformPlans.length > 0
    });
    
    if (isChangingToActive && platformPlans.length > 0) {
      setActivatePlanDialogOpen(true);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Only update status if it changed
      if (data.status !== user.status) {
        const statusUpdated = await onUpdateStatus(user.id, data.status);
        if (!statusUpdated) throw new Error("Failed to update user status");
      }
      
      // Only update role if it changed
      if (data.role !== user.role) {
        const roleUpdated = await onUpdateRole(user.id, data.role);
        if (!roleUpdated) throw new Error("Failed to update user role");
      }
      
      toast({
        title: "User updated",
        description: "User information has been updated successfully"
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user information"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivateWithPlan = async (planId: string, duration: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // First, update the user status to active
      const statusUpdated = await onUpdateStatus(user.id, 'active');
      
      if (!statusUpdated) {
        throw new Error("Failed to activate user");
      }
      
      // Update the role if needed
      if (form.getValues('role') !== user.role) {
        const roleUpdated = await onUpdateRole(user.id, form.getValues('role'));
        if (!roleUpdated) throw new Error("Failed to update user role");
      }
      
      // Then, create a subscription for the user
      const subscriptionEndDate = calculateEndDate(duration);
      
      const { error } = await supabase
        .from('platform_subscriptions')
        .insert({
          owner_id: user.id,
          plan_id: planId,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          auto_renew: true,
          status: 'active'
        });
      
      if (error) throw error;
      
      toast({
        title: "User updated",
        description: "User has been activated with a subscription plan"
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error activating user with plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to activate user with subscription plan"
      });
    } finally {
      setIsUpdating(false);
      setActivatePlanDialogOpen(false);
    }
  };

  const calculateEndDate = (duration: string): Date => {
    const today = new Date();
    
    switch (duration) {
      case 'monthly':
        return new Date(today.setMonth(today.getMonth() + 1));
      case 'quarterly':
        return new Date(today.setMonth(today.getMonth() + 3));
      case 'half-yearly':
        return new Date(today.setMonth(today.getMonth() + 6));
      case 'yearly':
        return new Date(today.setFullYear(today.getFullYear() + 1));
      default:
        return new Date(today.setMonth(today.getMonth() + 1));
    }
  };

  return {
    form,
    isUpdating,
    activatePlanDialogOpen,
    setActivatePlanDialogOpen,
    platformPlans,
    onSubmit,
    handleActivateWithPlan,
    watchedStatus
  };
};
