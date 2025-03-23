
export type OnboardingStep = "welcome" | "bot-selection" | "custom-bot-setup" | "official-bot-setup" | "connect-telegram" | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "bot-selection",
  // Dynamic routing based on selection:
  "custom-bot-setup", // Only for custom bot
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
