
import { useState } from "react";
import { useToast } from "@/features/community/components/ui/use-toast";
import { useCustomers } from "@/hooks/community/useCustomers";
import { CustomerDetailsSheet } from "@/features/community/components/customers/CustomerDetailsSheet";
import { CustomersTable } from "@/features/community/components/customers/CustomersTable";
import { CustomerFilters } from "@/features/community/components/customers/CustomerFilters";

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: customers, isLoading } = useCustomers();
  const { toast } = useToast();

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers?.filter((customer) => {
    if (
      searchQuery &&
      !customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (statusFilter !== "all" && customer.status !== statusFilter) {
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

      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="mt-6">
        <CustomersTable
          data={filteredCustomers || []}
          onViewDetails={handleCustomerSelect}
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
