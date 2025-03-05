
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Building,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAdminPayments } from "@/admin/hooks/useAdminPayments";
import { toast } from "sonner";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentType, setPaymentType] = useState<"platform" | "community">("platform");
  const { platformPayments, communityPayments, isLoading, refetch } = useAdminPayments();

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Pending
        </Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "paypal":
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case "crypto":
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      case "bank_transfer":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "telegram":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <p className="text-lg">Loading payment data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage and track all platform payments 💰
          </p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          onClick={handleExportReport}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

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
            <div className="relative w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${paymentType === "platform" ? "platform" : "community"} payments...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-indigo-100"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paymentType === "platform" ? (
            <div className="rounded-md border border-indigo-100">
              <Table>
                <TableHeader className="bg-indigo-50">
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlatformPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {searchQuery ? (
                          <p className="text-muted-foreground">No platform payments found matching your search.</p>
                        ) : (
                          <p className="text-muted-foreground">No platform payments found.</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlatformPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-indigo-50/30">
                        <TableCell className="font-medium">{payment.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.user}</p>
                            <p className="text-sm text-muted-foreground">{payment.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>{payment.community}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {getPaymentMethodIcon(payment.method)}
                          {payment.method?.replace('_', ' ') || 'Unknown'}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-indigo-100">
              <Table>
                <TableHeader className="bg-indigo-50">
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Community</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunityPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {searchQuery ? (
                          <p className="text-muted-foreground">No community payments found matching your search.</p>
                        ) : (
                          <p className="text-muted-foreground">No community payments found.</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCommunityPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-indigo-50/30">
                        <TableCell className="font-medium">{payment.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.user}</p>
                            <p className="text-sm text-muted-foreground">@{payment.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>{payment.community}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {getPaymentMethodIcon(payment.method)}
                          {payment.method?.replace('_', ' ') || 'Unknown'}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
