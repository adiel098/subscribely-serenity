
export interface PaymentMethod {
  id: string;
  provider: string;
  config?: any;
  is_active: boolean;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}
