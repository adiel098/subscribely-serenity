
import React from "react";
import { TableCell } from "@/components/ui/table";
import { 
  MoreHorizontal, 
  Edit, 
  ShieldAlert, 
  Ban,
  UserCheck,
  Key
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

  // Handler for permissions button click (placeholder for now)
  const handlePermissionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Permissions functionality will be implemented later
    console.log("Manage permissions for user:", user.id);
  };

  return (
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center space-x-1">
          {/* Edit action */}
          <button 
            onClick={handleEditClick}
            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" 
            title="Edit User"
            type="button"
          >
            <Edit className="h-4 w-4 text-indigo-600" />
          </button>
          
          {/* Status action - conditional based on user status */}
          {user.status === 'suspended' ? (
            <button 
              onClick={handleUnsuspendClick}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" 
              title="Unsuspend User"
              type="button"
            >
              <UserCheck className="h-4 w-4 text-green-600" />
            </button>
          ) : user.status === 'inactive' ? (
            <>
              <button 
                onClick={handleActivateClick}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" 
                title="Activate User"
                type="button"
              >
                <UserCheck className="h-4 w-4 text-green-600" />
              </button>
              <button 
                onClick={handleSuspendClick}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" 
                title="Suspend User"
                type="button"
              >
                <Ban className="h-4 w-4 text-red-600" />
              </button>
            </>
          ) : (
            <button 
              onClick={handleSuspendClick}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" 
              title="Suspend User"
              type="button"
            >
              <Ban className="h-4 w-4 text-red-600" />
            </button>
          )}
          
          {/* Permissions action */}
          <button 
            onClick={handlePermissionsClick}
            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors" 
            title="Manage Permissions"
            type="button"
          >
            <Key className="h-4 w-4 text-amber-600" />
          </button>
          
          {/* Dropdown menu for additional actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
              >
                <span className="sr-only">More options</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status === 'suspended' ? (
                <DropdownMenuItem onClick={handleUnsuspendClick} className="cursor-pointer">
                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-green-600">Unsuspend User</span>
                </DropdownMenuItem>
              ) : user.status === 'inactive' ? (
                <>
                  <DropdownMenuItem onClick={handleActivateClick} className="cursor-pointer">
                    <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-green-600">Activate User</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSuspendClick} className="cursor-pointer">
                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-600">Suspend User</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleSuspendClick} className="cursor-pointer">
                  <Ban className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-600">Suspend User</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handlePermissionsClick} className="cursor-pointer">
                <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
                Permissions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TableCell>
  );
};
