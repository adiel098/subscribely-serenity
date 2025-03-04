
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Edit, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  Users, 
  Ban,
  UserCheck,
  Shield,
  Trash2
} from "lucide-react";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";
import { formatDistanceToNow } from "date-fns";
import { AdminUser, AdminUserRole } from "@/admin/hooks/useAdminUsers";
import { EditUserDialog } from "./EditUserDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UsersTableProps {
  users: AdminUser[];
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
}

export const UsersTable = ({ users, onUpdateStatus, onUpdateRole }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

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
    setActivateDialogOpen(true);
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Communities</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-primary/10">
                        {user.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.full_name || ''} />
                        ) : (
                          <AvatarFallback className="bg-primary/5 text-primary-foreground">
                            {user.full_name
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{user.full_name || 'Unknown'}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="mr-1 h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span>{user.communities_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      <span>{user.subscriptions_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {user.created_at
                        ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
                        : 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'suspended' ? (
                          <DropdownMenuItem onClick={() => handleActivateUser(user)}>
                            <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-green-600">Activate User</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                            <Ban className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-600">Suspend User</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
                          Permissions
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onUpdateStatus={onUpdateStatus}
          onUpdateRole={onUpdateRole}
        />
      )}

      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedUser?.full_name || selectedUser?.email}? 
              This will prevent them from logging in or accessing any features of the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSuspend} className="bg-red-600 hover:bg-red-700">
              <Ban className="mr-2 h-4 w-4" />
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate {selectedUser?.full_name || selectedUser?.email}? 
              This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmActivate} className="bg-green-600 hover:bg-green-700">
              <UserCheck className="mr-2 h-4 w-4" />
              Activate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
