
/**
 * Detect if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

/**
 * Get mock user data for development/testing
 */
export const getMockUser = () => {
  return {
    id: "123456789",
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
    email: "test@example.com"
  };
};
