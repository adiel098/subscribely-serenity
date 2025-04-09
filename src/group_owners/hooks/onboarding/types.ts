
export type OnboardingStep = 
  | "welcome" 
  | "project-creation" 
  | "custom-bot-setup"
  | "connect-telegram"
  | "completion" 
  | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
}

export interface OnboardingProfile {
  onboarding_completed: boolean;
  onboarding_step: OnboardingStep;
}
