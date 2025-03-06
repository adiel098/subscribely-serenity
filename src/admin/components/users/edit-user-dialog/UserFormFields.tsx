
import { 
  FormField,
  FormControl,
  FormDescription,
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
import { UseFormReturn } from "react-hook-form";
import { AdminUserRole } from "@/admin/hooks/types/adminUsers.types";

type FormValues = {
  status: 'active' | 'inactive' | 'suspended';
  role: AdminUserRole;
};

interface UserFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const UserFormFields = ({ form }: UserFormFieldsProps) => {
  return (
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
  );
};
