
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Users,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { formatCurrency } from "@/admin/components/dashboard/formatters";
import { CommunityStatusBadge } from "./CommunityStatusBadge";
import { AdminCommunity } from "@/admin/hooks/useAdminCommunities";

interface CommunitiesTableProps {
  communities: AdminCommunity[];
  isLoading: boolean;
  isError: boolean;
}

export const CommunitiesTable: React.FC<CommunitiesTableProps> = ({
  communities,
  isLoading,
  isError,
}) => {
  return (
    <div className="rounded-md border border-indigo-100">
      <Table>
        <TableHeader className="bg-indigo-50">
          <TableRow>
            <TableHead className="w-[250px]">
              <div className="flex items-center gap-1">
                Name
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-center">Subscribers</TableHead>
            <TableHead className="text-center">Members</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-8 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-8 w-[50px] mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-8 w-[50px] mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[60px] ml-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-8 w-[80px] mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[40px] ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Error loading communities. Please try refreshing.
              </TableCell>
            </TableRow>
          ) : communities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No communities found.
              </TableCell>
            </TableRow>
          ) : (
            communities.map((community) => (
              <TableRow key={community.id} className="hover:bg-indigo-50/30">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8 border border-indigo-100">
                      {community.photoUrl ? (
                        <AvatarImage src={community.photoUrl} alt={community.name} />
                      ) : (
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">{community.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="ml-2">{community.name}</span>
                  </div>
                </TableCell>
                <TableCell>{community.owner_name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Users className="mr-2 h-4 w-4 text-indigo-600" />
                    {community.subscriptions}
                  </div>
                </TableCell>
                <TableCell className="text-center">{community.members}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(community.revenue)}</TableCell>
                <TableCell className="text-center">
                  <CommunityStatusBadge status={community.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-indigo-50">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-indigo-100">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4 text-indigo-600" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Edit className="h-4 w-4 text-indigo-600" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {community.status === "active" ? (
                        <DropdownMenuItem className="flex items-center gap-2 text-amber-600 cursor-pointer">
                          <AlertTriangle className="h-4 w-4" />
                          Suspend Community
                        </DropdownMenuItem>
                      ) : community.status === "suspended" ? (
                        <DropdownMenuItem className="flex items-center gap-2 text-green-600 cursor-pointer">
                          <CheckCircle2 className="h-4 w-4" />
                          Reactivate Community
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                        Delete Community
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
