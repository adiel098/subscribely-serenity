
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock, Ban } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Normalize status value to lowercase for case-insensitive comparison
  const normalizedStatus = status?.toLowerCase() || "unknown";
  
  switch (normalizedStatus) {
    case "completed":
    case "success":
    case "successful":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>
      );
    
    case "pending":
    case "processing":
    case "in_progress":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    
    case "failed":
    case "error":
    case "declined":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    
    case "cancelled":
    case "canceled":
    case "refunded":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
          <Ban className="h-3 w-3" /> Cancelled
        </Badge>
      );
    
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> {status || "Unknown"}
        </Badge>
      );
  }
};
