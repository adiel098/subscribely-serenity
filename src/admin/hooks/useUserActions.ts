
import { useState, useEffect } from "react";
import { AdminUser } from "./types/adminUsers.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useUserActions = (onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [activateWithPlanDialogOpen, setActivateWithPlanDialogOpen] = useState(false);
  const [platformPlans, setPlatformPlans] = useState<{ id: string; name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch platform plans when component mounts
  useEffect(() => {
    fetchPlatformPlans();
  }, []);

  const fetchPlatformPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_plans')
        .select('id, name')
        .eq('is_active', true);
      
      if (error) throw error;
      setPlatformPlans(data || []);
      console.log("Fetched platform plans:", data);
    } catch (error) {
      console.error("Error fetching platform plans:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load subscription plans",
      });
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSuspendUser = (user: AdminUser) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleActivateUser = (user: AdminUser) => {
    setSelectedUser(user);
    
    // If we have platform plans, show the plan selection dialog
    if (platformPlans && platformPlans.length > 0) {
      setActivateWithPlanDialogOpen(true);
    } else {
      // Fall back to the simple activation dialog if no plans exist
      setActivateDialogOpen(true);
    }
  };

  const confirmSuspend = async () => {
    if (selectedUser) {
      await onUpdateStatus(selectedUser.id, 'suspended');
    }
    setSuspendDialogOpen(false);
  };

  const confirmActivate = async () => {
    if (selectedUser) {
      await onUpdateStatus(selectedUser.id, 'active');
    }
    setActivateDialogOpen(false);
  };

  const confirmActivateWithPlan = async (planId: string, duration: string) => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    
    try {
      // First, update the user status to active
      const statusUpdated = await onUpdateStatus(selectedUser.id, 'active');
      
      if (!statusUpdated) {
        throw new Error("Failed to activate user");
      }
      
      // Then, create a subscription for the user
      const subscriptionEndDate = calculateEndDate(duration);
      
      const { error } = await supabase
        .from('platform_subscriptions')
        .insert({
          owner_id: selectedUser.id,
          plan_id: planId,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          auto_renew: true,
          status: 'active'
        });
      
      if (error) throw error;
      
      toast({
        title: "User activated",
        description: "User has been activated with a subscription plan"
      });
    } catch (error: any) {
      console.error("Error activating user with plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to activate user with subscription plan"
      });
    } finally {
      setIsProcessing(false);
      setActivateWithPlanDialogOpen(false);
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
    selectedUser,
    isEditDialogOpen,
    suspendDialogOpen,
    activateDialogOpen,
    activateWithPlanDialogOpen,
    platformPlans,
    isProcessing,
    setIsEditDialogOpen,
    setSuspendDialogOpen,
    setActivateDialogOpen,
    setActivateWithPlanDialogOpen,
    fetchPlatformPlans,
    handleEditUser,
    handleSuspendUser,
    handleActivateUser,
    confirmSuspend,
    confirmActivate,
    confirmActivateWithPlan
  };
};
