
// Helper service for managing local storage values consistently

interface OnboardingStatus {
  isCompleted: boolean;
  lastStep?: string;
}

export const localStorageService = {
  // Onboarding status
  getOnboardingStatus: (): OnboardingStatus | null => {
    const status = localStorage.getItem('onboarding_status');
    return status ? JSON.parse(status) : null;
  },
  
  setOnboardingStatus: (status: OnboardingStatus): void => {
    localStorage.setItem('onboarding_status', JSON.stringify(status));
  },
  
  // Community status
  getHasCommunity: (): boolean => {
    return localStorage.getItem('has_community') === 'true';
  },
  
  setHasCommunity: (value: boolean): void => {
    localStorage.setItem('has_community', value.toString());
  },
  
  // Current project
  getCurrentProjectId: (): string | null => {
    return localStorage.getItem('current_project_id');
  },
  
  setCurrentProjectId: (projectId: string): void => {
    localStorage.setItem('current_project_id', projectId);
  },
  
  // Clear all app data
  clearAllData: (): void => {
    localStorage.removeItem('onboarding_status');
    localStorage.removeItem('has_community');
    localStorage.removeItem('current_project_id');
  }
};
