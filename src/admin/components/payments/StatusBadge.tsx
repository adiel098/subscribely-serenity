
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
