import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, DollarSign, Globe, Users, TrendingUp, Activity, Building, CreditCard, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminStatistics } from "@/admin/hooks/useAdminStatistics";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: statistics, isLoading, error } = useAdminStatistics();

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderStatisticCards = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="hover-scale border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-500">Error loading dashboard statistics. Please try again later.</p>
        </Card>
      );
    }

    // Split cards into two rows of three
    return (
      <div className="space-y-6">
        {/* First row - 3 cards */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          <Card className="hover-scale border-indigo-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Communities
              </CardTitle>
              <Globe className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalCommunities}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                Platform-wide communities
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-scale border-blue-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Owners
              </CardTitle>
              <Building className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalOwners}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <UserCheck className="mr-1 h-3 w-3 text-blue-500" />
                {statistics?.activeSubscribedOwners} with active subscriptions
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-scale border-purple-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscribed Owners
              </CardTitle>
              <UserCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.activeSubscribedOwners}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {statistics?.totalOwners > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    {Math.round((statistics.activeSubscribedOwners / statistics.totalOwners) * 100)}% of owners
                  </>
                ) : (
                  "No owners registered yet"
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Second row - 3 cards */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          <Card className="hover-scale border-green-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Members
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalMembersInCommunities}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                Across all communities
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-scale border-orange-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics?.totalCommunityRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                Total payments to communities
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-scale border-pink-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <CreditCard className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics?.totalPlatformRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                Total payments to platform
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and monitoring metrics ✨
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {renderStatisticCards()}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-indigo-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown 📊</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                  <p className="text-muted-foreground">Chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3 border-blue-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>
                  Latest 5 activities in the system 🔔
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {[
                    { id: 1, activity: "User joined community", time: "1 hour ago", avatar: "U1" },
                    { id: 2, activity: "New subscription purchased", time: "2 hours ago", avatar: "U2" },
                    { id: 3, activity: "Payment received", time: "3 hours ago", avatar: "U3" },
                    { id: 4, activity: "New community created", time: "4 hours ago", avatar: "U4" },
                    { id: 5, activity: "User requested support", time: "5 hours ago", avatar: "U5" }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">{item.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.activity}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      <Activity className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activities</CardTitle>
              <CardDescription>Track and analyze user behavior patterns 📈</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                <p className="text-muted-foreground">Analytics data will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Data</CardTitle>
              <CardDescription>View and export detailed platform reports 📋</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                <p className="text-muted-foreground">Reports will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
