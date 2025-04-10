
export interface PaymentsResponse {
  platform_payments: RawPlatformPayment[];
  project_payments: RawProjectPayment[];
}

export interface RawPlatformPayment {
  id: string;
  owner_id: string;
  plan_id: string;
  amount: number;
  transaction_id?: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  subscription_id?: string;
  owner_email?: string;
  owner_name?: string;
  plan_name?: string;
}

export interface RawProjectPayment {
  id: string;
  project_id: string;
  plan_id: string;
  telegram_user_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  amount: number;
  discount_amount?: number;
  original_amount?: number;
  status: string;
  payment_method?: string;
  created_at: string;
  invite_link?: string;
  project_name?: string;
  plan_name?: string;
}

export interface PaymentItem {
  id: string;
  amount: number | string;
  status: string;
  paymentMethod?: string;
  created_at: string;
  type: 'platform' | 'project';
  payer?: {
    id: string;
    email?: string;
    name?: string;
    telegram_id?: string;
    telegram_username?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  plan?: {
    id: string;
    name?: string;
  };
  currency: string;
}
