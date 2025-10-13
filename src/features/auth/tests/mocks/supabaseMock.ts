/**
 * Mock do cliente Supabase para testes
 */

export const mockSupabaseClient = {
  auth: {
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    setSession: jest.fn(),
    getUser: jest.fn()
  }
};

export const mockCreateBrowserSupabaseClient = jest.fn(() => mockSupabaseClient); 