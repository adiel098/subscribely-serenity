
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
  
  // Handler for edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEditUser(user);
  };
  
  // Handler for suspend button click
  const handleSuspendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSuspendUser(user);
  };
  
  // Handler for activate button click
  const handleActivateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onActivateUser(user);
  };
  
  // Handler for unsuspend button click
  const handleUnsuspendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUnsuspendUser(user);
  };

  // General handler to stop propagation for all button clicks
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <TableCell className="text-right" onClick={handleButtonClick}>
      <div className="flex items-center justify-end gap-2">
        {/* Edit button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEditClick}
          title="Edit User"
          className="cursor-pointer"
        >
          <Edit className="h-4 w-4 text-indigo-600" />
        </Button>
        
        {/* Conditional rendering based on user status */}
        {user.status === 'suspended' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUnsuspendClick}
            title="Unsuspend User"
            className="cursor-pointer"
          >
            <UserCheck className="h-4 w-4 text-green-600" />
          </Button>
        ) : user.status === 'inactive' ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleActivateClick}
              title="Activate User"
              className="cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSuspendClick}
              title="Suspend User"
              className="cursor-pointer"
            >
              <Ban className="h-4 w-4 text-red-600" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSuspendClick}
            title="Suspend User"
            className="cursor-pointer"
          >
            <Ban className="h-4 w-4 text-red-600" />
          </Button>
        )}
        
        {/* Permissions button */}
        <Button
          variant="ghost"
          size="icon"
          title="Manage Permissions"
          onClick={handleButtonClick}
          className="cursor-pointer"
        >
          <ShieldAlert className="h-4 w-4 text-amber-600" />
        </Button>
        
        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleButtonClick}
              className="cursor-pointer"
            >
              <span className="sr-only">More options</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={handleButtonClick}>
            <DropdownMenuItem onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'suspended' ? (
              <DropdownMenuItem onClick={handleUnsuspendClick}>
                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-green-600">Unsuspend User</span>
              </DropdownMenuItem>
            ) : user.status === 'inactive' ? (
              <>
                <DropdownMenuItem onClick={handleActivateClick}>
                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-green-600">Activate User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSuspendClick}>
                  <Ban className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-600">Suspend User</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={handleSuspendClick}>
                <Ban className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-600">Suspend User</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleButtonClick}>
              <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
              Permissions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  );
};
