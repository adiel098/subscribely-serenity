
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, DollarSign, Globe, Users, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-scale border-indigo-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Communities
                </CardTitle>
                <Globe className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +2 last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,453</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +124 last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale border-green-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +3.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-scale border-purple-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Signups
                </CardTitle>
                <BarChart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +201 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
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

// Import missing Avatar components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
