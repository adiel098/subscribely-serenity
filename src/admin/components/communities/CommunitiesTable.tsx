import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCommunity } from "@/admin/hooks/useAdminCommunities";
import { formatCurrency } from "@/lib/utils";

interface CommunitiesTableProps {
  communities: AdminCommunity[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}

export const CommunitiesTable: React.FC<CommunitiesTableProps> = ({
  communities,
  isLoading,
  isError,
  onSort,
  sortColumn,
  sortDirection
}) => {
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown className="ml-2 h-4 w-4 text-indigo-600" /> 
      : <ArrowUpDown className="ml-2 h-4 w-4 text-indigo-600 rotate-180" />;
  };

  const renderSortableHeader = (column: string, label: string) => (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
      className="hover:bg-transparent hover:text-indigo-600 p-0 font-medium"
    >
      {label}
      {getSortIcon(column)}
    </Button>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="text-lg font-medium">Failed to load communities</h3>
        <p className="text-sm text-gray-500 mt-1">
          There was an error loading the community data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">{renderSortableHeader('name', 'Community Name')}</TableHead>
            <TableHead>{renderSortableHeader('owner', 'Owner')}</TableHead>
            <TableHead className="text-right">{renderSortableHeader('subscriptions', 'Subscribers')}</TableHead>
            <TableHead className="text-right">{renderSortableHeader('revenue', 'Revenue')}</TableHead>
            <TableHead className="text-center">{renderSortableHeader('status', 'Status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-[80px] ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-[80px] ml-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-[80px] mx-auto" /></TableCell>
              </TableRow>
            ))
          ) : communities && communities.length > 0 ? (
            communities.map((community) => (
              <TableRow key={community.id}>
                <TableCell className="font-medium">{community.name}</TableCell>
                <TableCell>{community.owner_name || 'Unknown'}</TableCell>
                <TableCell className="text-right">{community.subscriptions}</TableCell>
                <TableCell className="text-right">{formatCurrency(community.revenue)}</TableCell>
                <TableCell className="text-center">{getStatusBadge(community.status)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center py-4">
                  {communities && communities.length === 0 ? (
                    <>
                      <XCircle className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No communities found</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No data available</p>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
