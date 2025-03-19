
import React from "react";
import { format } from "date-fns";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PlatformSubscription } from "../../hooks/useUserPlatformSubscription";
import { useUserPlatformSubscription } from "../../hooks/useUserPlatformSubscription";

export const CurrentPlanCard = () => {
  const { subscription, isLoading, error, toggleAutoRenew } = useUserPlatformSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">No Active Plan</CardTitle>
          <CardDescription>
            You don't have an active platform subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-center">
              Subscribe to a plan to unlock all platform features
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="default">
            View Available Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-100">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-indigo-700">
              {subscription.plan_name}
            </CardTitle>
            <CardDescription>
              Your current active platform subscription
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <span className="font-medium">Plan Period</span>
          </div>
          <div className="text-sm text-gray-600">
            {format(new Date(subscription.subscription_start_date), "MMM d, yyyy")} 
            {subscription.subscription_end_date && (
              <> - {format(new Date(subscription.subscription_end_date), "MMM d, yyyy")}</>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-500" />
            <span className="font-medium">Plan Type</span>
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {subscription.plan_interval.charAt(0).toUpperCase() + subscription.plan_interval.slice(1)}
            </Badge>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Features:</h4>
          <ul className="space-y-1">
            {subscription.plan_features.map((feature, index) => (
              <li key={index} className="text-sm flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Auto-renew subscription</p>
            <p className="text-sm text-muted-foreground">
              {subscription.auto_renew 
                ? "Your subscription will renew automatically"
                : "Your subscription will expire at the end of the period"}
            </p>
          </div>
          <Switch
            checked={subscription.auto_renew}
            onCheckedChange={toggleAutoRenew}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center w-full pb-2">
          <p className="text-sm text-muted-foreground">
            Subscription will {subscription.auto_renew ? 'renew' : 'expire'} 
            {subscription.subscription_end_date && (
              <> on {format(new Date(subscription.subscription_end_date), "MMM d, yyyy")}</>
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  );
};
