
export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_amount: number;
  max_uses?: number | null;
  used_count: number;
  is_active: boolean;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  community_id?: string | null;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_amount: number;
  max_uses?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
  community_id: string;
}

export interface UpdateCouponData {
  id: string;
  code?: string;
  description?: string | null;
  discount_type?: DiscountType;
  discount_amount?: number;
  max_uses?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
}

export interface CheckCouponResult {
  isValid: boolean;
  coupon?: Coupon;
  message?: string;
  discountAmount?: number;
  finalPrice?: number;
}
