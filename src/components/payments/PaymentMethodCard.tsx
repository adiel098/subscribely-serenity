
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface PaymentMethodCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

export const PaymentMethodCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick 
}: PaymentMethodCardProps) => (
  <Card 
    className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
    onClick={onClick}
  >
    <CardContent className="p-6 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </CardContent>
  </Card>
);
