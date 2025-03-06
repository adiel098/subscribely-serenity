
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
    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-2">
        {/* Action buttons row */}
        <div className="flex items-center space-x-1">
          {/* Edit action */}
          <div 
            onClick={handleEditClick}
            className="p-2 rounded-md hover:bg-muted cursor-pointer group" 
            title="Edit User"
          >
            <Edit className="h-4 w-4 text-indigo-600 group-hover:text-indigo-800" />
          </div>
          
          {/* Status action - conditional based on user status */}
          {user.status === 'suspended' ? (
            <div 
              onClick={handleUnsuspendClick}
              className="p-2 rounded-md hover:bg-muted cursor-pointer group" 
              title="Unsuspend User"
            >
              <UserCheck className="h-4 w-4 text-green-600 group-hover:text-green-800" />
            </div>
          ) : user.status === 'inactive' ? (
            <>
              <div 
                onClick={handleActivateClick}
                className="p-2 rounded-md hover:bg-muted cursor-pointer group" 
                title="Activate User"
              >
                <UserCheck className="h-4 w-4 text-green-600 group-hover:text-green-800" />
              </div>
              <div 
                onClick={handleSuspendClick}
                className="p-2 rounded-md hover:bg-muted cursor-pointer group" 
                title="Suspend User"
              >
                <Ban className="h-4 w-4 text-red-600 group-hover:text-red-800" />
              </div>
            </>
          ) : (
            <div 
              onClick={handleSuspendClick}
              className="p-2 rounded-md hover:bg-muted cursor-pointer group" 
              title="Suspend User"
            >
              <Ban className="h-4 w-4 text-red-600 group-hover:text-red-800" />
            </div>
          )}
          
          {/* Permissions action */}
          <div 
            onClick={handlePermissionsClick}
            className="p-2 rounded-md hover:bg-muted cursor-pointer group" 
            title="Manage Permissions"
          >
            <Key className="h-4 w-4 text-amber-600 group-hover:text-amber-800" />
          </div>
          
          {/* Dropdown menu for additional actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div 
                className="p-2 rounded-md hover:bg-muted cursor-pointer group"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">More options</span>
                <MoreHorizontal className="h-4 w-4 group-hover:text-gray-800" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
