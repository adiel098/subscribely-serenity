import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

interface PaymentMethodCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isConfigured: boolean;
  onConfigure: () => void;
}

export const PaymentMethodCard = ({ 
  icon: Icon, 
  title, 
  description,
  isActive,
  onToggle,
  isConfigured,
  onConfigure
}: PaymentMethodCardProps) => (
  <Card className="relative">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span>{title}</span>
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {isActive ? 'Enabled' : 'Disabled'}
        </span>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          disabled={!isConfigured}
        />
      </div>
    </CardContent>
    {!isConfigured && (
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onConfigure}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </CardFooter>
    )}
  </Card>
);
