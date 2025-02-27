
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Calendar, LayoutGrid, User, History } from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { TelegramUserData } from '../services/userService';

interface UserDashboardProps {
  subscription: any;
  userData: TelegramUserData | null;
  community: any;
}

export const UserDashboard = ({ subscription, userData, community }: UserDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const timeRemaining = () => {
    if (!subscription?.subscription_end_date) return 'N/A';
    return formatDistanceToNow(new Date(subscription.subscription_end_date), { addSuffix: true });
  };

  const renderFeatures = () => {
    if (!subscription?.plan?.features || !Array.isArray(subscription.plan.features)) {
      return <p className="text-gray-500">No features specified for this plan.</p>;
    }

    return (
      <ul className="space-y-2 mt-2">
        {subscription.plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl">Your Subscription</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>
          <CardDescription>
            Manage your subscription for {community?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-slate-500 mr-2" />
              <span className="font-medium">Current Plan</span>
            </div>
            <span className="font-semibold text-primary">{subscription?.plan?.name || 'Standard'}</span>
          </div>
          
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-slate-500 mr-2" />
              <span className="font-medium">Start Date</span>
            </div>
            <span>{formatDate(subscription?.subscription_start_date)}</span>
          </div>
          
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-slate-500 mr-2" />
              <span className="font-medium">Expires</span>
            </div>
            <span>{timeRemaining()}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex-col space-y-3">
          <Button className="w-full">Renew Subscription</Button>
          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="details">
            <User className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              {renderFeatures()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Plan Type</p>
                <p className="font-medium">{subscription?.plan?.interval || 'Monthly'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">${subscription?.plan?.price || '0.00'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="font-medium">{formatDate(subscription?.subscription_end_date)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                Your payment history will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
