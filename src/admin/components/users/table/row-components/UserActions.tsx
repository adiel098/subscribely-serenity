
import React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  ShieldAlert, 
  Ban,
  UserCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface UserActionsProps {
  user: AdminUser;
  onEditUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
  onUnsuspendUser: (user: AdminUser) => void;
}

export const UserActions = ({
  user,
  onEditUser,
  onSuspendUser,
  onActivateUser,
  onUnsuspendUser
}: UserActionsProps) => {
  return (
    <TableCell>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditUser(user)}
          title="Edit User"
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4 text-indigo-600" />
        </Button>
        
        {user.status === 'suspended' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUnsuspendUser(user)}
            title="Unsuspend User"
            className="h-8 w-8"
          >
            <UserCheck className="h-4 w-4 text-green-600" />
          </Button>
        ) : user.status === 'inactive' ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onActivateUser(user)}
              title="Activate User"
              className="h-8 w-8"
            >
              <UserCheck className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSuspendUser(user)}
              title="Suspend User"
              className="h-8 w-8"
            >
              <Ban className="h-4 w-4 text-red-600" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSuspendUser(user)}
            title="Suspend User"
            className="h-8 w-8"
          >
            <Ban className="h-4 w-4 text-red-600" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          title="Manage Permissions"
          className="h-8 w-8"
          onClick={() => {}}
        >
          <ShieldAlert className="h-4 w-4 text-amber-600" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              <span className="sr-only">More options</span>
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
              <DropdownMenuItem onClick={() => onUnsuspendUser(user)}>
                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-green-600">Unsuspend User</span>
              </DropdownMenuItem>
            ) : user.status === 'inactive' ? (
              <>
                <DropdownMenuItem onClick={() => onActivateUser(user)}>
                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-green-600">Activate User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSuspendUser(user)}>
                  <Ban className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-600">Suspend User</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => onSuspendUser(user)}>
                <Ban className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-600">Suspend User</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => {}}>
              <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
              Permissions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  );
};
