
import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { Switch } from "@/features/community/components/ui/switch";
import { Button } from "@/features/community/components/ui/button";

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  isConfigured: boolean;
  onToggle: (active: boolean) => void;
  onConfigure: () => void;
}

export const PaymentMethodCard = ({
  title,
  description,
  icon: Icon,
  isActive,
  isConfigured,
  onToggle,
  onConfigure,
}: PaymentMethodCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={onToggle}
            disabled={!isConfigured}
          />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isConfigured && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onConfigure}
          >
            Configure
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
