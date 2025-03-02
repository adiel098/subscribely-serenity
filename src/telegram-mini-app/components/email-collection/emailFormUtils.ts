
/**
 * Validates if the provided email has a valid format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if the provided Telegram ID is a numeric string
 */
export const validateTelegramId = (telegramId: string): boolean => {
  return /^\d+$/.test(telegramId);
};
