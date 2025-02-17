
import { useCustomers } from "@/hooks/useCustomers";
import CustomersTable from "@/components/customers/CustomersTable";
import { CustomerDetailsSheet } from "@/components/customers/CustomerDetailsSheet";
import { useState } from "react";

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { data: customers } = useCustomers();

  const customer = customers?.find(c => c.id === selectedCustomer);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <CustomersTable />
      {customer && (
        <CustomerDetailsSheet
          customer={customer}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </div>
  );
};

export default Customers;
