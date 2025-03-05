
/**
 * Formats a number as a currency string in USD
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a number to include a plus sign if positive
 */
export const formatWithSign = (value: number) => {
  return value > 0 ? `+${value}` : `${value}`;
};

/**
 * Formats a percentage value
 */
export const formatPercentage = (value: number) => {
  return `${value}%`;
};
