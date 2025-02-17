import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface SubscriptionPlanCardProps {
  plan: any;
  onEdit: () => void;
  onDelete: (planId: string) => void;
  intervalColors: { [key: string]: string };
  intervalLabels: { [key: string]: string };
}

export const SubscriptionPlanCard = ({
  plan,
  onEdit,
  onDelete,
  intervalColors,
  intervalLabels,
}: SubscriptionPlanCardProps) => {
  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
        <CardDescription>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${intervalColors[plan.interval]}`}
          >
            {intervalLabels[plan.interval]}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-gray-600 mb-4">{plan.description}</div>
        <div className="text-2xl font-bold text-gray-900">${plan.price}</div>
      </CardContent>
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
        <Button size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(plan.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
};
