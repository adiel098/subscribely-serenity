
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
  size?: 'default' | 'sm';
}

export const UserStatusBadge = ({ status, size = 'default' }: UserStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle2 className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'success' as const,
          label: 'Active'
        };
      case 'suspended':
        return {
          icon: <XCircle className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'destructive' as const,
          label: 'Suspended'
        };
      case 'inactive':
        return {
          icon: <Clock className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'outline' as const,
          label: 'Inactive'
        };
      default:
        return {
          icon: <Clock className={size === 'sm' ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />,
          variant: 'outline' as const,
          label: 'Unknown'
        };
    }
  };
  
  const { icon, variant, label } = getStatusConfig();
  
  return (
    <Badge 
      variant={variant} 
      className={`
        flex items-center 
        ${size === 'sm' ? 'text-xs py-0 px-2 h-5' : ''}
      `}
    >
      {icon}
      {label}
    </Badge>
  );
};
