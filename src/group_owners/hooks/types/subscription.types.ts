
export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal' | 'crypto';
  is_active: boolean;
  config: Record<string, any>;
  owner_id?: string;
  community_id?: string;
  created_at: string;
  updated_at: string;
}
