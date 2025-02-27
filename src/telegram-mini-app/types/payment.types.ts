
import { Plan } from "@/telegram-mini-app/types";

export interface PaymentConfig {
  stripePublicKey?: string;
  merchantId?: string;
  environment?: 'test' | 'production';
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isAvailable: boolean;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  redirectUrl?: string;
  inviteLink?: string;
}

export interface CreatePaymentIntent {
  planId: string;
  userId: string;
  paymentMethod: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  clientSecret: string;
  status: string;
}
