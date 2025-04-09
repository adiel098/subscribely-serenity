
// Onboarding step types
export type OnboardingStep = 
  | "welcome" 
  | "bot-setup"
  | "project-creation"
  | "connect-telegram"
  | "completion"
  | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "project-creation",
  "bot-setup",
  "connect-telegram",
  "completion",
  "complete"
];
