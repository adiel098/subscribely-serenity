
export type OnboardingStep = "welcome" | "connect-telegram" | "platform-plan" | "payment-method" | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "connect-telegram",
  "platform-plan",
  "payment-method",
  "complete"
];

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}
