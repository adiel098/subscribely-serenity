import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCustomers } from "@/hooks/admin/useCustomers";
import { Skeleton } from "@/components/ui/skeleton";

export const CustomerProfile = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const { data: customers, isLoading } = useCustomers();

  useEffect(() => {
    if (customers && customerId) {
      const foundCustomer = customers.find((c: any) => c.id === customerId);
      setCustomer(foundCustomer);
    }
  }, [customers, customerId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card>
        <CardContent>
          Customer not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer?.profile?.full_name || "No Name"}</CardTitle>
        <CardDescription>User ID: {customer.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={customer?.profile?.avatar_url} />
            <AvatarFallback>{customer?.profile?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{customer?.profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
