
import { useState } from "react";
import { Button } from "@/features/community/components/ui/button";
import { Save, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { Input } from "@/features/community/components/ui/input";
import { Label } from "@/features/community/components/ui/label";
import { Textarea } from "@/features/community/components/ui/textarea";
import { Badge } from "@/features/community/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/features/community/components/ui/avatar";
import { useCustomers } from "@/hooks/community/useCustomers";

interface CustomerProfileProps {
  data: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    status: "active" | "inactive";
    created_at: string;
    profile_image_url: string | null;
  };
}

export const CustomerProfile = ({ data }: CustomerProfileProps) => {
  const [formData, setFormData] = useState({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes,
  });
  const { toast } = useToast();
  const { updateCustomer } = useCustomers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomer.mutateAsync({
        id: data.id,
        ...formData,
      });
      
      toast({
        title: "Success",
        description: "Customer profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer profile",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {data.profile_image_url ? (
                  <AvatarImage src={data.profile_image_url} />
                ) : (
                  <AvatarFallback>{data.full_name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle>{data.full_name}</CardTitle>
                <CardDescription>Customer since {new Date(data.created_at).toLocaleDateString()}</CardDescription>
              </div>
            </div>
            <Badge variant={data.status === "active" ? "success" : "secondary"}>
              {data.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
