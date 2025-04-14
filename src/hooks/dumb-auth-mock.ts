/**
 * This file provides a dumb mock implementation of useAuth that can be used
 * during development when you need to bypass actual authentication.
 * 
 * IMPORTANT: DO NOT use this in production.
 */

export const useDumbAuthMock = () => {
  return {
    user: {
      id: 'mock-user-id-123',
      email: 'mock@example.com',
      user_metadata: {
        full_name: 'Mock User',
      },
    },
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600 * 1000,
    },
    isLoading: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null, user: null }),
    signOut: async () => {},
    resetPassword: async () => ({ error: null }),
  };
};

// To use this mock, you can replace:
// import { useAuth } from '@/hooks/useAuth';
// with:
// import { useDumbAuthMock as useAuth } from '@/hooks/dumb-auth-mock';
