
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Search,
  Plus,
  Users,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Globe
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCommunities } from "@/admin/hooks/useAdminCommunities";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCommunities() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: communities, isLoading, isError, refetch } = useAdminCommunities();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredCommunities = communities?.filter(
    community => community.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                community.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Inactive
        </Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Suspended
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">
            Manage all platform communities 🌐
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Community
        </Button>
      </div>

      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <span>Community Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or owner..."
                className="pl-8 w-full border-indigo-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-indigo-100 flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                className="border-indigo-100 flex items-center gap-2" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

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
                ) : filteredCommunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No communities found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommunities.map((community) => (
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
                      <TableCell className="text-right font-semibold">${community.revenue}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(community.status)}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
