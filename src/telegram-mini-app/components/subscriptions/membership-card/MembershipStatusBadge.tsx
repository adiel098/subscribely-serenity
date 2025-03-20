
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Subscription } from "../../../services/memberService";

interface MembershipStatusBadgeProps {
  status: string;
}

export const MembershipStatusBadge: React.FC<MembershipStatusBadgeProps> = ({ status }) => {
  let badgeContent;
  
  switch (status?.toLowerCase()) {
    case 'active':
      badgeContent = {
        label: 'Active',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        variant: 'success',
        className: 'bg-emerald-50 text-emerald-600 border-emerald-100'
      };
      break;
      
    case 'trial':
      badgeContent = {
        label: 'Trial',
        icon: <Sparkles className="h-3 w-3 mr-1" />,
        variant: 'info',
        className: 'bg-blue-50 text-blue-600 border-blue-100'
      };
      break;
      
    case 'pending':
      badgeContent = {
        label: 'Pending',
        icon: <Clock className="h-3 w-3 mr-1" />,
        variant: 'warning',
        className: 'bg-amber-50 text-amber-600 border-amber-100'
      };
      break;
      
    case 'expired':
      badgeContent = {
        label: 'Expired',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        variant: 'destructive',
        className: 'bg-red-50 text-red-600 border-red-100'
      };
      break;
      
    default:
      badgeContent = {
        label: status || 'Unknown',
        icon: null,
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-600'
      };
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex items-center gap-0.5 px-2 py-0.5 font-medium uppercase ${badgeContent.className}`}
    >
      {badgeContent.icon}
      {badgeContent.label}
    </Badge>
  );
};
