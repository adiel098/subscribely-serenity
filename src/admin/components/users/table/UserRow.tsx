
import { useState } from "react";
import { 
  TableCell, 
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
} from "lucide-react";
import { UserStatusBadge } from "../UserStatusBadge";
import { UserRoleBadge } from "../UserRoleBadge";
import { formatDistanceToNow } from "date-fns";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface UserRowProps {
  user: AdminUser;
  onEditUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
}

export const UserRow = ({ 
  user, 
  onEditUser, 
  onSuspendUser, 
  onActivateUser 
}: UserRowProps) => {
  return (
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
        <UserStatusBadge status={user.status} size="sm" />
      </TableCell>
      <TableCell>
        <UserRoleBadge role={user.role} size="sm" />
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
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'suspended' ? (
              <DropdownMenuItem onClick={() => onActivateUser(user)}>
                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-green-600">Activate User</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onSuspendUser(user)}>
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
  );
};
