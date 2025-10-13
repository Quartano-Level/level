import { passwordService } from '../services/passwordService';
import { mockSupabaseClient } from './mocks/supabaseMock';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  createBrowserSupabaseClient: () => mockSupabaseClient
}));

describe('passwordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset password email successfully', async () => {
      // Mock do retorno do Supabase
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: null
      });

      const result = await passwordService.sendResetPasswordEmail({
        email: 'test@example.com',
        redirectUrl: 'https://example.com/reset-password'
      });

      expect(result).toEqual({ success: true });
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'https://example.com/reset-password' }
      );
    });

    it('should throw error when reset password email fails', async () => {
      const mockError = new Error('Failed to send email');
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: mockError
      });

      await expect(
        passwordService.sendResetPasswordEmail({
          email: 'test@example.com',
          redirectUrl: 'https://example.com/reset-password'
        })
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('checkEmailExists', () => {
    it('should return true when email exists', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: null
      });

      const result = await passwordService.checkEmailExists('test@example.com');

      expect(result).toEqual({ exists: true });
    });

    it('should return false when email does not exist', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: { message: 'User not found' }
      });

      const result = await passwordService.checkEmailExists('nonexistent@example.com');

      expect(result).toEqual({ exists: false });
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const result = await passwordService.updatePassword({ password: 'newPassword123' });

      expect(result).toEqual({ success: true, user: mockUser });
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123'
      });
    });

    it('should throw error when update password fails', async () => {
      const mockError = new Error('Failed to update password');
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { user: null },
        error: mockError
      });

      await expect(
        passwordService.updatePassword({ password: 'newPassword123' })
      ).rejects.toThrow('Failed to update password');
    });
  });
}); 