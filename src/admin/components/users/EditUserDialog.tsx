
import { useState } from "react";
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
import { AdminUser, AdminUserRole } from "@/admin/hooks/useAdminUsers";
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
  
  const form = useForm<FormValues>({
    defaultValues: {
      status: user?.status || 'active',
      role: user?.role || 'user',
    }
  });
  
  // Update form when user changes
  if (user && (form.getValues('status') !== user.status || form.getValues('role') !== user.role)) {
    form.reset({
      status: user.status,
      role: user.role,
    });
  }
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
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
      
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
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
  );
};
