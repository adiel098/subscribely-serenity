
import { formatCurrency } from "@/lib/utils";

export interface RawPlatformPayment {
  id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  payment_status: string;
  plan_id: string;
  owner_id: string;
  plan_name?: string;
  profiles?: {
    full_name: string;
    email: string;
  }[];
}

export interface RawCommunityPayment {
  id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  status: string;
  first_name: string;
  last_name: string;
  telegram_username: string;
  community: {
    name: string;
  }[];
}

export interface PaymentItem {
  id: string;
  user: string;
  email: string;
  amount: number | string;
  community: string;
  date: string;
  method: string;
  status: string;
  raw_data: any;
}

/**
 * Formats a date string into a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Transforms raw platform payment data into a standardized PaymentItem format
 */
export const transformPlatformPayments = (
  platformData: RawPlatformPayment[]
): PaymentItem[] => {
  return (platformData || []).map(item => ({
    id: item.id,
    user: item.profiles?.[0]?.full_name || 'Unknown',
    email: item.profiles?.[0]?.email || 'No email',
    amount: formatCurrency(item.amount),
    community: item.plan_name || 'Platform Payment',
    date: formatDate(item.created_at),
    method: item.payment_method || '',
    status: item.payment_status || '',
    raw_data: item
  }));
};

/**
 * Transforms raw community payment data into a standardized PaymentItem format
 */
export const transformCommunityPayments = (
  communityData: RawCommunityPayment[]
): PaymentItem[] => {
  return (communityData || []).map(item => ({
    id: item.id,
    user: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown',
    email: item.telegram_username || 'No username',
    amount: formatCurrency(item.amount), 
    community: item.community?.[0]?.name || 'Unknown Community',
    date: formatDate(item.created_at),
    method: item.payment_method || '',
    status: item.status || '',
    raw_data: item
  }));
};
