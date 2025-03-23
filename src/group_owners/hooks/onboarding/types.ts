
export type OnboardingStep = "welcome" | "bot-selection" | "custom-bot-setup" | "connect-telegram" | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "bot-selection",
  "connect-telegram",
  "complete"
]; // Note: custom-bot-setup is not included here as it's optional in the flow

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}
