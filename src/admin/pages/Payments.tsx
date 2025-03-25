
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Loader2, Building, Users, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAdminPayments } from "@/admin/hooks/useAdminPayments";
import { toast } from "sonner";
import { PaymentsHeader } from "@/admin/components/payments/PaymentsHeader";
import { PaymentSearch } from "@/admin/components/payments/PaymentSearch";
import { PaymentTable } from "@/admin/components/payments/PaymentTable";
import { PageHeader } from "@/components/ui/page-header";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentType, setPaymentType] = useState<"platform" | "community">("platform");
  const { platformPayments, communityPayments, isLoading, refetch, error } = useAdminPayments();

  const filteredPlatformPayments = platformPayments.filter(payment => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      payment.user.toLowerCase().includes(searchTerm) ||
      payment.email.toLowerCase().includes(searchTerm) ||
      payment.id.toLowerCase().includes(searchTerm) ||
      payment.community.toLowerCase().includes(searchTerm)
    );
  });

  const filteredCommunityPayments = communityPayments.filter(payment => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      payment.user.toLowerCase().includes(searchTerm) ||
      payment.email.toLowerCase().includes(searchTerm) ||
      payment.id.toLowerCase().includes(searchTerm) ||
      payment.community.toLowerCase().includes(searchTerm)
    );
  });

  const handleExportReport = () => {
    const paymentsToExport = paymentType === "platform" ? platformPayments : communityPayments;
    
    if (paymentsToExport.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Create CSV content
    const headers = ["ID", "User", "Email", "Amount", "Community/Plan", "Date", "Method", "Status"];
    const csvContent = [
      headers.join(","),
      ...paymentsToExport.map(payment => [
        payment.id,
        payment.user.replace(/,/g, ""),
        payment.email.replace(/,/g, ""),
        typeof payment.amount === 'number' ? payment.amount.toFixed(2) : payment.amount,
        payment.community.replace(/,/g, ""),
        payment.date,
        payment.method.replace(/,/g, ""),
        payment.status.replace(/,/g, "")
      ].join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${paymentType}-payments-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Report exported successfully");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <p className="text-lg">Loading payment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p className="text-lg">Error loading payment data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container px-0 py-4 max-w-5xl ml-4 space-y-6">
      <PageHeader
        title="Payments"
        description="Manage and track all platform payments 💰"
        icon={<CreditCard />}
        actions={
          <PaymentsHeader onExportReport={handleExportReport} />
        }
      />

      {/* Payment Type Tabs */}
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Payment Management</CardTitle>
          <CardDescription>
            Switch between platform and community payments
          </CardDescription>
          
          <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as "platform" | "community")} className="mt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
              <TabsTrigger value="platform" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Platform Payments
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community Payments
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center justify-between mt-4">
            <PaymentSearch 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              paymentType={paymentType}
            />
          </div>
        </CardHeader>
        <CardContent>
          {paymentType === "platform" ? (
            <PaymentTable 
              payments={filteredPlatformPayments} 
              isFiltered={searchQuery.length > 0}
              type="platform"
            />
          ) : (
            <PaymentTable 
              payments={filteredCommunityPayments} 
              isFiltered={searchQuery.length > 0}
              type="community"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
