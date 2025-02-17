import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CustomerDetailsSheet } from "./CustomerDetailsSheet";
import { CustomerProfile } from "./CustomerProfile";
import { useCustomers } from "@/hooks/community/useCustomers";

interface DataTableSearchProps {
  table: any;
}

export function DataTableSearch({ table }: DataTableSearchProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();
  const { data: customers, isLoading, refetch } = useCustomers("");

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter customers..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      {selectedCustomer && (
        <CustomerDetailsSheet
          customer={selectedCustomer}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
}

interface Props {
  communityId: string;
}

const CustomersTable = ({ communityId }: Props) => {
  const { data: customers, isLoading, refetch } = useCustomers(communityId);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  {customer.subscription_status ? "Active" : "Inactive"}
                </TableCell>
                <TableCell className="text-right">
                  <Button onClick={() => handleCustomerClick(customer)}>
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedCustomer && (
        <CustomerDetailsSheet
          customer={selectedCustomer}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
};

export default CustomersTable;
