
import { Shield, User, Crown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminUserRole } from "@/admin/hooks/useAdminUsers";

interface UserRoleBadgeProps {
  role: AdminUserRole;
}

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  switch (role) {
    case "super_admin":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1">
          <Crown className="h-3 w-3" /> Super Admin
        </Badge>
      );
    case "moderator":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
          <Shield className="h-3 w-3" /> Moderator
        </Badge>
      );
    case "community_owner":
      return (
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
          <Users className="h-3 w-3" /> Community Owner
        </Badge>
      );
    case "user":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
          <User className="h-3 w-3" /> User
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" /> Unknown
        </Badge>
      );
  }
};
