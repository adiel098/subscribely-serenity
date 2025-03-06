
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
  User,
} from "lucide-react";
import { UserStatusBadge } from "../UserStatusBadge";
import { UserRoleBadge } from "../UserRoleBadge";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";
import { formatDate } from "@/group_owners/utils/dateUtils";

interface UserRowProps {
  user: AdminUser;
  onEditUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
  onUnsuspendUser: (user: AdminUser) => void;
}

export const UserRow = ({ 
  user, 
  onEditUser, 
  onSuspendUser, 
  onActivateUser,
  onUnsuspendUser
}: UserRowProps) => {
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <TableRow className="hover:bg-muted/30">
      {/* User Column */}
      <TableCell>
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

      {/* Status Column */}
      <TableCell className="text-center">
        <div className="flex justify-center">
          <UserStatusBadge status={user.status} size="sm" />
        </div>
      </TableCell>

      {/* Role Column */}
      <TableCell className="text-center">
        <div className="flex justify-center">
          <UserRoleBadge role={user.role} size="sm" />
        </div>
      </TableCell>

      {/* Communities Column */}
      <TableCell className="text-center">
        <div className="flex justify-center items-center gap-1">
          <Users className="h-4 w-4 text-indigo-500" />
          <span>{user.communities_count}</span>
        </div>
      </TableCell>

      {/* Subscriptions Column */}
      <TableCell className="text-center">
        <div className="flex justify-center items-center gap-1">
          <User className="h-4 w-4 text-indigo-500" />
          <span>{user.subscriptions_count}</span>
        </div>
      </TableCell>

      {/* Joined Column */}
      <TableCell className="text-center">
        <div className="flex justify-center items-center text-xs">
          <Calendar className="mr-1 h-3 w-3" />
          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : 'Unknown'}
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleAction(e, () => onEditUser(user))}
            title="Edit User"
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4 text-indigo-600" />
          </Button>
          
          {user.status === 'suspended' ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleAction(e, () => onUnsuspendUser(user))}
              title="Unsuspend User"
              className="h-8 w-8"
            >
              <UserCheck className="h-4 w-4 text-green-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleAction(e, () => user.status === 'inactive' ? onActivateUser(user) : onSuspendUser(user))}
              title={user.status === 'inactive' ? "Activate User" : "Suspend User"}
              className="h-8 w-8"
            >
              {user.status === 'inactive' ? (
                <UserCheck className="h-4 w-4 text-green-600" />
              ) : (
                <Ban className="h-4 w-4 text-red-600" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            title="Manage Permissions"
            className="h-8 w-8"
            onClick={(e) => handleAction(e, () => {})}
          >
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">More options</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEditUser(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status === 'suspended' ? (
                <DropdownMenuItem onClick={() => onUnsuspendUser(user)}>
                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-green-600">Unsuspend User</span>
                </DropdownMenuItem>
              ) : user.status === 'inactive' ? (
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
        </div>
      </TableCell>
    </TableRow>
  );
};
