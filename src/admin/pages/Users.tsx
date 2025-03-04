
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AdminManagement } from "@/admin/components/users/AdminManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Eye, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for demonstration
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "Community Owner",
      joinDate: "May 15, 2023",
      avatar: null
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "active",
      role: "Community Owner",
      joinDate: "Jun 22, 2023",
      avatar: null
    },
    {
      id: "3",
      name: "Robert Brown",
      email: "robert@example.com",
      status: "inactive",
      role: "Community Owner",
      joinDate: "Apr 10, 2023",
      avatar: null
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      status: "active",
      role: "Admin",
      joinDate: "Jul 5, 2023",
      avatar: null
    },
    {
      id: "5",
      name: "Michael Johnson",
      email: "michael@example.com",
      status: "suspended",
      role: "Community Owner",
      joinDate: "Mar 18, 2023",
      avatar: null
    }
  ];

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getRoleBadge = (role: string) => {
    if (role === "Admin") {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1">
        <Shield className="h-3 w-3" /> Admin
      </Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
      {role}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and permissions 👥
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Tabs defaultValue="all-users" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="admin-management">Admin Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-users" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">User Directory</CardTitle>
              <CardDescription>
                View and manage all platform users
              </CardDescription>
              <div className="flex items-center justify-between mt-4">
                <div className="relative w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border-indigo-100"
                  />
                </div>
                <Button variant="outline" className="border-indigo-100 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-indigo-600" />
                  Filter Users
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-indigo-100">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-indigo-50/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8 border border-indigo-100">
                              {user.avatar ? (
                                <AvatarImage src={user.avatar} alt={user.name} />
                              ) : (
                                <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                  {user.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          {user.email}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          {user.joinDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100 flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin-management" className="space-y-4">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Users;
