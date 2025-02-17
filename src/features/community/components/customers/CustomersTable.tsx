
import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerDetailsSheet } from "./CustomerDetailsSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { format } from "date-fns";

const CustomersTable = () => {
  const { data: customers, isLoading } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const selectedCustomerData = customers?.find(c => c.id === selectedCustomer);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.full_name}</TableCell>
              <TableCell>
                <Badge
                  variant={customer.subscription_status ? "success" : "secondary"}
                >
                  {customer.subscription_status ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(customer.joined_at), "PPP")}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCustomer(customer.id);
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

      {selectedCustomerData && (
        <CustomerDetailsSheet
          customer={selectedCustomerData}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
};

export default CustomersTable;
