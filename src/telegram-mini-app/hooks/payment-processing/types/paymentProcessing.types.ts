
import { Subscription } from "../../../services/memberService";

export interface PaymentProcessingParams {
  communityId: string;
  planId: string;
  planPrice: number;
  planInterval?: string;
  communityInviteLink?: string | null;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  activeSubscription?: Subscription | null;
}

export interface PaymentProcessingState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  inviteLink: string | null;
}
