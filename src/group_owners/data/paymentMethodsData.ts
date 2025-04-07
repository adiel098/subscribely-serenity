
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";

// Maps payment method providers to their respective image URLs
export const PAYMENT_METHOD_IMAGES: Record<string, string> = {
  'stripe': "/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png",
  'paypal': "/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png",
  'crypto': "/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png"
};

// Default payment method configurations
export const DEFAULT_PAYMENT_METHODS: Partial<PaymentMethod>[] = [
  {
    provider: 'stripe',
    is_active: false,
    config: {}
  },
  {
    provider: 'paypal',
    is_active: false,
    config: {}
  },
  {
    provider: 'crypto',
    is_active: false,
    config: {}
  }
];
