
export type OnboardingStep = 
  | "welcome" 
  | "project-creation" 
  | "custom-bot-setup" 
  | "completion" 
  | "complete";

export interface OnboardingStatus {
  isCompleted: boolean;
  lastStep?: OnboardingStep;
  currentStep?: OnboardingStep;
}
