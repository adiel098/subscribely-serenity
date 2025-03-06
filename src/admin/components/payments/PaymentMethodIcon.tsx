
import { CreditCard, DollarSign } from "lucide-react";

interface PaymentMethodIconProps {
  method: string;
}

export const PaymentMethodIcon = ({ method }: PaymentMethodIconProps) => {
  switch (method?.toLowerCase()) {
    case "credit_card":
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case "paypal":
      return <DollarSign className="h-4 w-4 text-indigo-500" />;
    case "crypto":
      return <DollarSign className="h-4 w-4 text-orange-500" />;
    case "bank_transfer":
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case "telegram":
      return <DollarSign className="h-4 w-4 text-blue-500" />;
    default:
      return <DollarSign className="h-4 w-4 text-gray-500" />;
  }
};
