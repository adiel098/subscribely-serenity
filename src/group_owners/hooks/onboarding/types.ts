
export type OnboardingStep = 
  | "welcome"
  | "project-creation"
  | "custom-bot-setup"
  | "bot-setup"     // Added this step
  | "connect-telegram" 
  | "completion"
  | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "project-creation",
  "custom-bot-setup",
  "connect-telegram",
  "completion",
  "complete"
];

// Add OnboardingState interface
export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}
