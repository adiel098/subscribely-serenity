
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  description: string;
  descriptionIcon?: LucideIcon;
  descriptionIconColor?: string;
  borderColor?: string;
}

export const StatisticCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  description,
  descriptionIcon: DescriptionIcon,
  descriptionIconColor,
  borderColor = "border-gray-100",
}: StatisticCardProps) => {
  return (
    <Card className={`hover-scale shadow-sm ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {DescriptionIcon && (
            <DescriptionIcon
              className={`mr-1 h-3 w-3 ${descriptionIconColor || ""}`}
            />
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
