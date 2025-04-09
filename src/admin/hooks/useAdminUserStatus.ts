
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdminUserStatus = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    setIsUpdating(true);
    
    try {
      // Update the users table (previously profiles)
      let updates = {};
      
      if (status === 'suspended') {
        updates = { is_suspended: true, status: 'suspended' };
      } else if (status === 'active') {
        updates = { is_suspended: false, status: 'active', last_login: new Date().toISOString() };
      } else if (status === 'inactive') {
        updates = { is_suspended: false, status: 'inactive', last_login: null };
      }
      
      // Updated to use 'users' table
      const { error: userError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
        
      if (userError) throw userError;
      
      // If status is inactive, also update any platform subscriptions to inactive
      if (status === 'inactive') {
        const { error: subscriptionError } = await supabase
          .from('platform_subscriptions')
          .update({ 
            status: 'inactive',
            auto_renew: false 
          })
          .eq('owner_id', userId)
          .eq('status', 'active');
          
        if (subscriptionError) {
          console.error("Error updating subscriptions:", subscriptionError);
          // Don't throw here, we'll continue even if this fails
        }
      }
      
      // Log the status change
      await supabase.from('system_logs').insert({
        event_type: `user_status_${status}`,
        details: `User status updated to ${status}`,
        user_id: userId,
        metadata: { updated_by: (await supabase.auth.getUser()).data.user?.id }
      });
      
      toast({
        title: "User updated",
        description: `User status changed to ${status}`,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (err: any) {
      console.error("❌ Error updating user status:", err);
      toast({
        variant: "destructive",
        title: "Error updating user",
        description: err.message,
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateUserStatus,
    isUpdating
  };
};
