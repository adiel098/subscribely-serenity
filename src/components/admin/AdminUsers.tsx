
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { AddAdminDialog } from "./AddAdminDialog";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  };
}

export const AdminUsers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          id,
          role,
          created_at,
          profiles:profiles!admin_users_user_id_fkey (
            full_name,
            email
          )
        `);

      if (error) throw error;
      return data as AdminUser[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!adminUsers?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No admin users found
                </TableCell>
              </TableRow>
            ) : (
              adminUsers.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.profiles.full_name || 'N/A'}</TableCell>
                  <TableCell>{admin.profiles.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      admin.role === 'super_admin' ? 'default' :
                      admin.role === 'admin' ? 'secondary' : 'outline'
                    }>
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(admin.created_at), 'PP')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddAdminDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
};
