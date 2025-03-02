
/**
 * Validates if the provided email has a valid format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if the provided Telegram ID is a numeric string
 */
export const validateTelegramId = (telegramId: string): boolean => {
  return /^\d+$/.test(telegramId);
};

/**
 * Processes Telegram user data for logging or debugging
 */
export const formatUserDataForLogging = (user: any): string => {
  if (!user) return 'No user data';
  
  return JSON.stringify({
    id: user.id,
    username: user.username || 'No username',
    first_name: user.first_name || 'No first name',
    hasPhoto: !!user.photo_url
  });
};

/**
 * Triggers Telegram haptic feedback if available
 */
export const triggerHapticFeedback = (type: 'success' | 'error' | 'warning' | 'selection' = 'success'): void => {
  if (!window.Telegram?.WebApp?.HapticFeedback) {
    console.log('Haptic feedback not available');
    return;
  }
  
  switch (type) {
    case 'success':
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      break;
    case 'error':
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      break;
    case 'warning':
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      break;
    case 'selection':
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
      break;
    default:
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
  }
};
