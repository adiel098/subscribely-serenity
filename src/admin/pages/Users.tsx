
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
      joinDate: "2023-05-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "active",
      role: "Community Owner",
      joinDate: "2023-06-22",
    },
    {
      id: "3",
      name: "Robert Brown",
      email: "robert@example.com",
      status: "inactive",
      role: "Community Owner",
      joinDate: "2023-04-10",
    },
  ];

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage platform users and their permissions
        </p>
      </div>

      <Tabs defaultValue="all-users">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="admin-management">Admin Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                View and manage all platform users
              </CardDescription>
              <div className="flex gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
