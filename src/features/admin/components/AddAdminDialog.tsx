import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddAdminDialog = ({ open, onOpenChange }: AddAdminDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'admin' | 'moderator' | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userInfo, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-info', email],
    queryFn: async () => {
      if (!email) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!email,
  });

  const addAdminMutation = useMutation({
    mutationFn: async () => {
      if (!userInfo?.id || !role) throw new Error('Missing required fields');

      const { error } = await supabase
        .from('admin_users')
        .insert([{ 
          user_id: userInfo.id, 
          role: role
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: "Success", description: "Admin user added successfully" });
      onOpenChange(false);
      setEmail("");
      setRole(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAdminMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
            />
            {isLoadingUser && (
              <div className="text-sm text-muted-foreground">
                Checking user...
              </div>
            )}
            {userInfo && (
              <div className="text-sm text-green-600">
                User found: {userInfo.full_name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Admin Role</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'moderator') => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!userInfo || !role || addAdminMutation.isPending}
            >
              {addAdminMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Admin
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
