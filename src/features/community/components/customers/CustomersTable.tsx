
import { useState } from "react";
import { useCustomers, Customer } from "@/hooks/community/useCustomers";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerDetailsSheet } from "./CustomerDetailsSheet";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const CustomersTable = () => {
  const { data: customers, isLoading } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.telegram_username || 'No username'}</TableCell>
              <TableCell>
                <Badge variant={customer.subscription_status ? "success" : "secondary"}>
                  {customer.subscription_status ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(customer.joined_at), "PPP")}
              </TableCell>
              <TableCell>{customer.plan?.name || 'No plan'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setOpen(true);
                  }}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCustomer && (
        <CustomerDetailsSheet
          customer={selectedCustomer}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
};
