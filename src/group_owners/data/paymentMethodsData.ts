
import { CreditCard, DollarSign, Bitcoin } from "lucide-react";

export const PAYMENT_METHOD_ICONS: Record<string, any> = {
  stripe: CreditCard,
  paypal: DollarSign,
  crypto: Bitcoin,
};

export const PAYMENT_METHOD_IMAGES: Record<string, string> = {
  stripe: "/images/payment-methods/stripe.svg",
  paypal: "/images/payment-methods/paypal.svg",
  crypto: "/images/payment-methods/crypto.svg",
};

export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  crypto: "Crypto",
};

export const PAYMENT_METHOD_DESCRIPTIONS: Record<string, string> = {
  stripe: "קבל תשלומים באמצעות כרטיסי אשראי",
  paypal: "קבל תשלומים באמצעות חשבון PayPal",
  crypto: "קבל תשלומים במטבעות קריפטוגרפיים שונים",
};
