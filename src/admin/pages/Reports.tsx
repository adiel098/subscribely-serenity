
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
import { Button } from "@/components/ui/button";
import { 
  BarChart as BarChartIcon, 
  LineChart, 
  Calendar, 
  Download, 
  FileText, 
  Filter, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  Users,
  Globe,
  HelpCircle
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Reports() {
  // For a real application, this would be actual chart data
  // Here we're just showing placeholder UI

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View reports and analyze platform performance 📊
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-[150px] border-indigo-100">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Period</SelectLabel>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,832</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>+18% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Communities
            </CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>+4 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,845</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Payments
            </CardTitle>
            <HelpCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              <span>+5 from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-indigo-100 shadow-sm">
              <CardHeader className="pb-2 flex justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-[130px] h-8 text-xs border-indigo-100">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <LineChart className="h-8 w-8 mb-2" />
                    <p>Revenue chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 shadow-sm">
              <CardHeader className="pb-2 flex justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Member Growth</CardTitle>
                  <CardDescription>New members acquisition</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-[130px] h-8 text-xs border-indigo-100">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <BarChartIcon className="h-8 w-8 mb-2" />
                    <p>Member growth chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="pb-2 flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Available Reports</CardTitle>
                <CardDescription>Download detailed platform reports</CardDescription>
              </div>
              <Button variant="outline" className="border-indigo-100 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Reports
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { 
                    title: "Monthly Revenue Report", 
                    description: "Detailed breakdown of all revenue streams",
                    icon: CircleDollarSign,
                    date: "Generated on Oct 01, 2023" 
                  },
                  { 
                    title: "Member Activity Report", 
                    description: "Analysis of user engagement and behavior",
                    icon: Users,
                    date: "Generated on Oct 01, 2023" 
                  },
                  { 
                    title: "Community Performance", 
                    description: "Metrics on community growth and engagement",
                    icon: Globe,
                    date: "Generated on Oct 01, 2023" 
                  },
                  { 
                    title: "Payment Processing Report", 
                    description: "Details on successful and failed payments",
                    icon: CircleDollarSign,
                    date: "Generated on Oct 01, 2023" 
                  },
                  { 
                    title: "Conversion Rate Analysis", 
                    description: "Visitor to subscriber conversion metrics",
                    icon: BarChartIcon,
                    date: "Generated on Oct 01, 2023" 
                  },
                  { 
                    title: "Platform Usage Statistics", 
                    description: "Overall platform usage and performance",
                    icon: LineChart,
                    date: "Generated on Oct 01, 2023" 
                  }
                ].map((report, index) => (
                  <Card key={index} className="border-indigo-100 hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <report.icon className="h-5 w-5 text-indigo-600" />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4 text-indigo-600" />
                        </Button>
                      </div>
                      <CardTitle className="text-base mt-2">{report.title}</CardTitle>
                      <CardDescription className="text-xs">{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {report.date}
                      </div>
                      <Button variant="link" className="text-xs text-indigo-600 p-0 h-auto mt-2">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue breakdown by source and time period</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                <div className="flex flex-col items-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2" />
                  <p>Revenue analytics data will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle>Member Analytics</CardTitle>
              <CardDescription>Membership statistics and user activity metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Users className="h-8 w-8 mb-2" />
                  <p>Member analytics data will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communities" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle>Community Analytics</CardTitle>
              <CardDescription>Performance metrics for all communities</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <div className="h-full w-full flex items-center justify-center bg-muted/10 rounded-md border border-dashed border-muted">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Globe className="h-8 w-8 mb-2" />
                  <p>Community analytics data will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
