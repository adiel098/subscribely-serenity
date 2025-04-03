
/**
 * Generates a random string for use as an IPN secret key
 * @param length The length of the string to generate
 * @returns A random string of the specified length
 */
export function generateRandomSecret(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Validates a cryptocurrency wallet address (basic format check)
 * @param address The cryptocurrency wallet address to validate
 * @param currency The cryptocurrency type (e.g., 'BTC', 'ETH')
 * @returns Whether the address is valid
 */
export function validateCryptoAddress(address: string, currency: string = 'BTC'): boolean {
  if (!address) return false;
  
  // Very basic format validation
  switch (currency.toUpperCase()) {
    case 'BTC':
      // Bitcoin addresses typically start with 1, 3, or bc1
      return /^(1|3|bc1)[a-zA-Z0-9]{25,90}$/.test(address);
    case 'ETH':
      // Ethereum addresses are 42 characters and start with 0x
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'USDT':
    case 'USDC':
      // These are typically ERC-20 tokens with Ethereum addresses
      return /^0x[a-fA-F0-9]{40}$/.test(address) || validateCryptoAddress(address, 'BTC');
    default:
      // Basic check for most cryptocurrencies
      return address.length >= 26 && address.length <= 90;
  }
}
