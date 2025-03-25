
// If the file doesn't exist, we'll create it with this content
export type OnboardingStep = 
  | "welcome" 
  | "bot-selection" 
  | "custom-bot-setup" 
  | "connect-telegram"
  | "completion" 
  | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "bot-selection",
  "custom-bot-setup",
  "connect-telegram",
  "completion",
  "complete"
];

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}
