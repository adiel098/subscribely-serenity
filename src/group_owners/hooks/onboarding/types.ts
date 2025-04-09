
export type OnboardingStep = 
  | "welcome"
  | "project-creation"
  | "custom-bot-setup"
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
