import { useState } from "react";
import { useCustomers } from "@/hooks/community/useCustomers";
import { CustomerDetailsSheet } from "@/features/community/components/customers/CustomerDetailsSheet";
import { CustomersTable } from "@/features/community/components/customers/CustomersTable";
import { CustomerFilters } from "@/features/community/components/customers/CustomerFilters";
import { Loader2 } from "lucide-react";

const Customers = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: customers, isLoading } = useCustomers({ searchTerm, statusFilter });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <CustomersTable
        customers={customers || []}
        onCustomerSelect={setSelectedCustomerId}
      />

      <CustomerDetailsSheet
        customerId={selectedCustomerId}
        open={Boolean(selectedCustomerId)}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      />
    </div>
  );
};

export default Customers;
