
import { useState, useEffect } from "react";
import { Check, X, Save, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminUser, AdminUserRole } from "@/admin/hooks/types/adminUsers.types";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { ActivateUserWithPlanDialog } from "./dialogs/ActivateUserWithPlanDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EditUserDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
}

type FormValues = {
  status: 'active' | 'inactive' | 'suspended';
  role: AdminUserRole;
};

export const EditUserDialog = ({ 
  user, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onUpdateRole 
}: EditUserDialogProps) => {
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

    if (isOpen) {
      fetchPlatformPlans();
    }
  }, [isOpen]);
  
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

  if (!user) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {user.full_name} ({user.email})
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Current Status</h3>
                  <UserStatusBadge status={user.status} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Current Role</h3>
                  <UserRoleBadge role={user.role} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Controls user access to the platform
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Regular User</SelectItem>
                          <SelectItem value="community_owner">Community Owner</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Defines user permissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={isUpdating}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ActivateUserWithPlanDialog
        user={user}
        isOpen={activatePlanDialogOpen}
        onOpenChange={setActivatePlanDialogOpen}
        onConfirm={handleActivateWithPlan}
        plans={platformPlans}
        isLoading={isUpdating}
      />
    </>
  );
};
