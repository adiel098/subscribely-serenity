const ONBOARDING_STATUS_KEY = 'onboarding_status';
const HAS_COMMUNITY_KEY = 'has_community';

export const localStorageService = {
  // Onboarding Status
  setOnboardingStatus: (status: { currentStep: string; isCompleted: boolean }) => {
    localStorage.setItem(ONBOARDING_STATUS_KEY, JSON.stringify(status));
  },
  
  getOnboardingStatus: () => {
    const status = localStorage.getItem(ONBOARDING_STATUS_KEY);
    return status ? JSON.parse(status) : null;
  },
  
  clearOnboardingStatus: () => {
    localStorage.removeItem(ONBOARDING_STATUS_KEY);
  },

  // Community Status
  setHasCommunity: (hasCommunity: boolean) => {
    localStorage.setItem(HAS_COMMUNITY_KEY, JSON.stringify(hasCommunity));
  },
  
  getHasCommunity: () => {
    const status = localStorage.getItem(HAS_COMMUNITY_KEY);
    return status ? JSON.parse(status) : null;
  },
  
  clearHasCommunity: () => {
    localStorage.removeItem(HAS_COMMUNITY_KEY);
  },

  // Clear all
  clearAll: () => {
    localStorage.removeItem(ONBOARDING_STATUS_KEY);
    localStorage.removeItem(HAS_COMMUNITY_KEY);
  }
};
