
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { grantAdminAccess, AdminRole } from "@/admin/utils/adminUtils";
import { useToast } from "@/components/ui/use-toast";

export const AdminManagement = () => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AdminRole>("moderator");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGrantAccess = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await grantAdminAccess(userId, role);
      // Reset form
      setUserId("");
    } catch (error) {
      console.error("Failed to grant admin access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Admin Access</CardTitle>
        <CardDescription>
          Add administrative privileges to a user by their User ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value as AdminRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGrantAccess} 
            disabled={isLoading || !userId}
            className="mt-2"
          >
            {isLoading ? "Processing..." : "Grant Admin Access"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
