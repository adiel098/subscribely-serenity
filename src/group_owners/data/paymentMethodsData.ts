
import { CreditCard, DollarSign, Landmark, Bitcoin } from "lucide-react";

// Icons for payment methods
export const PAYMENT_METHOD_ICONS: Record<string, React.ElementType> = {
  'stripe': CreditCard,
  'paypal': DollarSign,
  'crypto': Bitcoin,
  'bank': Landmark
};

// Image sources for payment methods
export const PAYMENT_METHOD_IMAGES: Record<string, string> = {
  'stripe': '/lovable-uploads/5a20d054-33f7-43c0-8b20-079ddd9a5dd3.png',
  'paypal': '/lovable-uploads/1fe01199-01ba-4d5d-9d6e-88af5097a5f0.png',
  'crypto': '/lovable-uploads/d7aa5d26-7f8d-42f8-bdc1-7c9b5567f6c1.png'
};
