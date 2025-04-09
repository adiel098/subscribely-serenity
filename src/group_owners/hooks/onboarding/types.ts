
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

// Define temporary storage for data during onboarding
export interface OnboardingData {
  project?: {
    name: string;
    description?: string;
    bot_token?: string;
  };
  communities?: string[];
}
