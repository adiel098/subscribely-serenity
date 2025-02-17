
import { useState } from "react";
import { useToast } from "@/features/community/components/ui/use-toast";
import { useCustomers } from "@/hooks/community/useCustomers";
import { CustomerDetailsSheet } from "@/features/community/components/customers/CustomerDetailsSheet";
import { CustomersTable } from "@/features/community/components/customers/CustomersTable";
import { CustomerFilters } from "@/features/community/components/customers/CustomerFilters";

export type Customer = {
  id: string;
  full_name: string | null;
  email: string;
  status: string;
  subscription_status: boolean;
  total_spent: number;
  join_date: string;
};

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    subscription: "all",
    search: "",
  });

  const { data: customers, isLoading } = useCustomers();
  const { toast } = useToast();

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers?.filter((customer) => {
    if (
      filters.search &&
      !customer.full_name?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !customer.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.status !== "all" && customer.status !== filters.status) {
      return false;
    }

    if (
      filters.subscription !== "all" &&
      String(customer.subscription_status) !== filters.subscription
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view your customer base
          </p>
        </div>
      </div>

      <CustomerFilters filters={filters} onFiltersChange={setFilters} />

      <div className="mt-6">
        <CustomersTable
          customers={filteredCustomers || []}
          isLoading={isLoading}
          onCustomerSelect={handleCustomerSelect}
        />
      </div>

      <CustomerDetailsSheet
        isOpen={!!selectedCustomer}
        onClose={handleCloseDetails}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default Customers;
