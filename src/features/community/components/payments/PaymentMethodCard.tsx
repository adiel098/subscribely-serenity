import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
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
}: PaymentMethodCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 mr-2" />
          {title}
        </CardTitle>
        <Switch id={title} checked={isActive} onCheckedChange={onToggle} />
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <Label htmlFor={title} className="text-sm text-muted-foreground">
            {isActive ? "Enabled" : "Disabled"}
          </Label>
          {!isConfigured && (
            <Button variant="secondary" size="sm" onClick={onConfigure}>
              Configure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
