
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
  Filter, 
  CreditCard, 
  Download, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Sample payment data
const PAYMENTS = [
  { 
    id: "PAY-1234", 
    user: "John Doe", 
    email: "john@example.com", 
    amount: 19.99, 
    date: "2023-10-15", 
    status: "completed", 
    method: "credit_card", 
    community: "Tech Enthusiasts"
  },
  { 
    id: "PAY-2345", 
    user: "Jane Smith", 
    email: "jane@example.com", 
    amount: 49.99, 
    date: "2023-10-14", 
    status: "completed", 
    method: "paypal", 
    community: "Fitness Club"
  },
  { 
    id: "PAY-3456", 
    user: "Bob Johnson", 
    email: "bob@example.com", 
    amount: 9.99, 
    date: "2023-10-13", 
    status: "failed", 
    method: "crypto", 
    community: "Crypto Traders"
  },
  { 
    id: "PAY-4567", 
    user: "Alice Williams", 
    email: "alice@example.com", 
    amount: 29.99, 
    date: "2023-10-12", 
    status: "pending", 
    method: "bank_transfer", 
    community: "Book Club"
  },
  { 
    id: "PAY-5678", 
    user: "Charlie Brown", 
    email: "charlie@example.com", 
    amount: 39.99, 
    date: "2023-10-11", 
    status: "completed", 
    method: "credit_card", 
    community: "Gaming Community"
  }
];

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredPayments = PAYMENTS.filter(
    (payment) =>
      payment.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
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
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "paypal":
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case "crypto":
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      case "bank_transfer":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage and track all platform payments 💰
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="all-payments" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="all-payments">All Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all-payments" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Payment Transactions</CardTitle>
              <CardDescription>
                View and filter all payment transactions
              </CardDescription>
              <div className="flex items-center justify-between mt-4">
                <div className="relative w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user, email or payment ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border-indigo-100"
                  />
                </div>
                <Button variant="outline" className="border-indigo-100 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-indigo-600" />
                  Filter Payments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-indigo-50/30">
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.user}</p>
                            <p className="text-sm text-muted-foreground">{payment.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">${payment.amount}</TableCell>
                        <TableCell>{payment.community}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {getPaymentMethodIcon(payment.method)}
                          {payment.method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payments</CardTitle>
              <CardDescription>All successful payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-indigo-100">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PAYMENTS.filter(p => p.status === 'completed').map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell className="font-medium text-green-600">${payment.amount}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Payments waiting to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-indigo-100">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PAYMENTS.filter(p => p.status === 'pending').map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell className="font-medium text-yellow-600">${payment.amount}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments</CardTitle>
              <CardDescription>Payments that could not be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-indigo-100">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PAYMENTS.filter(p => p.status === 'failed').map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell className="font-medium text-red-600">${payment.amount}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-indigo-100">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
