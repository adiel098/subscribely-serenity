import { Plan } from "@/telegram-mini-app/types/community.types";

export interface PaymentState {
  isProcessing: boolean;
  paymentInviteLink: string | null;
}

export interface CreateMemberData {
  telegram_id: string;
  community_id: string;
  subscription_plan_id: string;
  status?: 'active' | 'inactive' | 'pending';
  payment_id?: string;
}

export interface PaymentData {
  plan_id: string;
  community_id: string;
  amount: number;
  payment_method: string;
  status: string;
  invite_link: string;
  telegram_user_id?: string; // Made optional
}
