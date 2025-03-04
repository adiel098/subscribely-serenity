
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdminUserStatus = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    setIsUpdating(true);
    
    try {
      // Since we don't have direct access to auth.admin API from the client,
      // we'll update a field in the profiles table instead
      let updates = {};
      
      if (status === 'suspended') {
        updates = { is_suspended: true };
      } else if (status === 'active') {
        updates = { is_suspended: false, last_login: new Date().toISOString() };
      } else if (status === 'inactive') {
        updates = { is_suspended: false, last_login: null };
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      
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
