
export type OnboardingStep = "welcome" | "bot-selection" | "connect-telegram" | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "bot-selection",
  "connect-telegram",
  "complete"
];

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}
