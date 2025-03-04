
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Inactive
        </Badge>
      );
    case "suspended":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Suspended
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Unknown
        </Badge>
      );
  }
};
