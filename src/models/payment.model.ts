export interface Payment {
  id: string;
  community_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  external_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'expired';

export type PaymentProvider = 
  | 'stripe'
  | 'nowpayments'
  | 'telegram';
