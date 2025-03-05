
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface CommunityStatusBadgeProps {
  status: string;
}

export const CommunityStatusBadge: React.FC<CommunityStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Inactive
        </Badge>
      );
    case "suspended":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Suspended
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
