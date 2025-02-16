
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ChevronRight, Check } from "lucide-react";

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isConfigured: boolean;
  onConfigure: () => void;
}

export const PaymentMethodCard = ({ 
  title, 
  description, 
  icon: Icon,
  isActive,
  onToggle,
  isConfigured,
  onConfigure
}: PaymentMethodCardProps) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Switch checked={isActive} onCheckedChange={onToggle} disabled={!isConfigured} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2">
        {isConfigured ? (
          <div className="flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Configured
          </div>
        ) : (
          <div className="flex items-center text-sm text-amber-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            Configuration required
          </div>
        )}
      </div>
    </CardContent>
    <CardFooter>
      <Button
        variant="ghost"
        className="w-full justify-between group-hover:bg-primary/5 transition-colors"
        onClick={onConfigure}
      >
        Configure settings
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </CardFooter>
  </Card>
);
