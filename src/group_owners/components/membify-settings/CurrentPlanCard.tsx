
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
import { Loader2, CheckCircle2, Calendar, AlertCircle, Package, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PlatformSubscription } from "../../hooks/useUserPlatformSubscription";
import { useUserPlatformSubscription } from "../../hooks/useUserPlatformSubscription";
import { useNavigate } from "react-router-dom";

export const CurrentPlanCard = () => {
  const { subscription, isLoading, error, toggleAutoRenew } = useUserPlatformSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white h-full">
        <CardHeader className="pb-3 border-b border-indigo-100">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-indigo-700">
                No Active Plan
              </CardTitle>
              <CardDescription className="text-indigo-700/70">
                Upgrade to unlock all platform features
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Inactive
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center">
          <div className="bg-indigo-100 rounded-full p-5 mb-4">
            <Package className="h-10 w-10 text-indigo-600" />
          </div>
          <p className="text-gray-600 text-center mb-6">
            Subscribe to a platform plan to unlock advanced features and manage multiple communities
          </p>
          <ul className="space-y-2 self-start w-full mb-6">
            {["Manage multiple communities", "Create subscription groups", "Access advanced analytics"].map((feature, index) => (
              <li key={index} className="text-sm flex items-start">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-2 pb-6 flex-col">
          <Button 
            onClick={() => navigate('/platform-plans')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
          >
            View Available Plans
            <ChevronRight className="h-4 w-4" />
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
