
import { Plan } from "./app.types";

export interface PaymentState {
  isProcessing: boolean;
  paymentInviteLink: string | null;
}

export interface CreateMemberData {
  telegramUserId: string;
  communityId: string;
  planId: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
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
