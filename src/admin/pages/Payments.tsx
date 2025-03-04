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
  AlertTriangle,
  Building,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Payment types
interface BasePlatformPayment {
  id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  payment_status: string;
}

interface PlatformPayment extends BasePlatformPayment {
  owner: {
    full_name: string;
    email: string;
  } | null;
  plan: {
    name: string;
  } | null;
}

interface CommunityPayment {
  id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  status: string;
  first_name: string;
  last_name: string;
  telegram_username: string;
  community: {
    name: string;
  } | null;
}

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [platformPayments, setPlatformPayments] = useState<PlatformPayment[]>([]);
  const [communityPayments, setCommunityPayments] = useState<CommunityPayment[]>([]);
  const [paymentType, setPaymentType] = useState<"platform" | "community">("platform");
  
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      
      try {
        // Fetch platform payments
        const { data: platformData, error: platformError } = await supabase
          .from('platform_payments')
          .select(`
            id,
            amount,
            created_at,
            payment_method,
            payment_status,
            owner_id,
            owner:profiles(full_name, email),
            plan:platform_plans(name)
          `)
          .order('created_at', { ascending: false });
        
        if (platformError) throw platformError;
        setPlatformPayments(platformData || []);
        
        // Fetch community payments
        const { data: communityData, error: communityError } = await supabase
          .from('subscription_payments')
          .select(`
            id,
            amount,
            created_at,
            payment_method,
            status,
            first_name,
            last_name,
            telegram_username,
            community:communities(name)
          `)
          .order('created_at', { ascending: false });
        
        if (communityError) throw communityError;
        setCommunityPayments(communityData || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  const filteredPlatformPayments = platformPayments.filter(payment => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      payment.owner?.full_name?.toLowerCase().includes(searchTerm) ||
      payment.owner?.email?.toLowerCase().includes(searchTerm) ||
      payment.id.toLowerCase().includes(searchTerm) ||
      payment.plan?.name?.toLowerCase().includes(searchTerm)
    );
  });

  const filteredCommunityPayments = communityPayments.filter(payment => {
    const searchTerm = searchQuery.toLowerCase();
    const fullName = `${payment.first_name || ''} ${payment.last_name || ''}`.trim();
    return (
      fullName.toLowerCase().includes(searchTerm) ||
      payment.telegram_username?.toLowerCase().includes(searchTerm) ||
      payment.id.toLowerCase().includes(searchTerm) ||
      payment.community?.name?.toLowerCase().includes(searchTerm)
    );
  });

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
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
            <Button variant="outline" className="border-indigo-100 flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-600" />
              Filter Payments
            </Button>
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
                            <p className="font-medium">{payment.owner?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{payment.owner?.email || 'No email'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">${Number(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.plan?.name || 'Unknown Plan'}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {getPaymentMethodIcon(payment.payment_method)}
                          {payment.payment_method?.replace('_', ' ') || 'Unknown'}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
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
                            <p className="font-medium">{`${payment.first_name || ''} ${payment.last_name || ''}`.trim() || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">@{payment.telegram_username || 'No username'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">${Number(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.community?.name || 'Unknown Community'}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {getPaymentMethodIcon(payment.payment_method)}
                          {payment.payment_method?.replace('_', ' ') || 'Unknown'}
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

      {/* Keep the original Tabs section for payment status filtering */}
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
