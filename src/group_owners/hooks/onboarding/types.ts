
// Onboarding step types
export type OnboardingStep = 
  | "welcome" 
  | "bot-setup"
  | "bot-selection"
  | "custom-bot-setup"
  | "project-creation"
  | "connect-telegram"
  | "completion"
  | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "project-creation",
  "bot-selection", // Added bot-selection step
  "bot-setup",
  "connect-telegram",
  "completion",
  "complete"
];

// Define the OnboardingState interface for useOnboardingStatus
export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected?: boolean;
  hasPlatformPlan?: boolean;
  hasPaymentMethod?: boolean;
}
