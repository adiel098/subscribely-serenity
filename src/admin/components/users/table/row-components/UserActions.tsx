
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
  // Create a wrapper function for all click handlers to ensure event propagation is properly stopped
  const handleButtonClick = (
    e: React.MouseEvent,
    callback: (user: AdminUser) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    callback(user);
  };

  return (
    <TableCell className="relative" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleButtonClick(e, onEditUser)}
          title="Edit User"
          className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
        >
          <Edit className="h-4 w-4 text-indigo-600" />
        </Button>
        
        {user.status === 'suspended' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleButtonClick(e, onUnsuspendUser)}
            title="Unsuspend User"
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
          >
            <UserCheck className="h-4 w-4 text-green-600" />
          </Button>
        ) : user.status === 'inactive' ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleButtonClick(e, onActivateUser)}
              title="Activate User"
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
            >
              <UserCheck className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleButtonClick(e, onSuspendUser)}
              title="Suspend User"
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
            >
              <Ban className="h-4 w-4 text-red-600" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleButtonClick(e, onSuspendUser)}
            title="Suspend User"
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
          >
            <Ban className="h-4 w-4 text-red-600" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          title="Manage Permissions"
          className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Permissions action will be implemented later
          }}
        >
          <ShieldAlert className="h-4 w-4 text-amber-600" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none active:scale-95"
            >
              <span className="sr-only">More options</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 bg-popover shadow-md">
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-accent focus:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onEditUser(user);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'suspended' ? (
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent focus:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnsuspendUser(user);
                }}
              >
                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-green-600">Unsuspend User</span>
              </DropdownMenuItem>
            ) : user.status === 'inactive' ? (
              <>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivateUser(user);
                  }}
                >
                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-green-600">Activate User</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSuspendUser(user);
                  }}
                >
                  <Ban className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-600">Suspend User</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent focus:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuspendUser(user);
                }}
              >
                <Ban className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-600">Suspend User</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-accent focus:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                // Permissions action will be implemented later
              }}
            >
              <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
              Permissions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  );
};
