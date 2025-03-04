
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Users, Shield, ShieldAlert } from "lucide-react";
import { AdminUserRole } from "@/admin/hooks/types/adminUsers.types";

interface UserRoleBadgeProps {
  role: AdminUserRole;
  size?: 'default' | 'sm';
}

export const UserRoleBadge = ({ role, size = 'default' }: UserRoleBadgeProps) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'super_admin':
        return {
          icon: <ShieldAlert className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'default' as const,
          className: 'bg-red-500 hover:bg-red-600',
          label: 'Super Admin'
        };
      case 'moderator':
        return {
          icon: <Shield className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600',
          label: 'Moderator'
        };
      case 'community_owner':
        return {
          icon: <Users className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600',
          label: 'Community Owner'
        };
      case 'user':
        return {
          icon: <User className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'outline' as const,
          className: '',
          label: 'User'
        };
      default:
        return {
          icon: <User className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'outline' as const,
          className: '',
          label: 'Unknown'
        };
    }
  };
  
  const { icon, variant, className, label } = getRoleConfig();
  
  return (
    <Badge 
      variant={variant} 
      className={`
        flex items-center 
        ${className} 
        ${size === 'sm' ? 'text-xs py-0 px-2 h-5' : ''}
      `}
    >
      {icon}
      {label}
    </Badge>
  );
};
